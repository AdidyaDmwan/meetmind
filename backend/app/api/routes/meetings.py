import os
import uuid
import asyncio
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.core.whisper import transcribe_audio
from app.api.deps import get_current_user
from app.models.user import User
from app.models.meeting import Meeting, ActionItem, KeyDecision
from app.schemas.meeting import MeetingResponse

router = APIRouter(prefix="/meetings", tags=["Meetings"])

ALLOWED_AUDIO = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm"}
ALLOWED_TEXT = {".txt", ".pdf"}

@router.post("/upload", response_model=MeetingResponse, status_code=201)
async def upload_meeting(
    title: str = Form(...),
    file: UploadFile = File(...),
    meeting_date: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO | ALLOWED_TEXT:
        raise HTTPException(status_code=400, detail=f"Format file tidak didukung: {ext}")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    parsed_date = None
    if meeting_date:
        try:
            parsed_date = datetime.fromisoformat(meeting_date)
        except ValueError:
            pass

    meeting = Meeting(
        user_id=current_user.id,
        title=title,
        status="processing",
        file_url=file_path,
        meeting_date=parsed_date
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    asyncio.create_task(process_meeting(str(meeting.id), file_path, ext))

    return MeetingResponse(
        id=str(meeting.id),
        title=meeting.title,
        status=meeting.status,
        summary=meeting.summary,
        raw_transcript=meeting.raw_transcript,
        language=meeting.language,
        meeting_date=meeting.meeting_date,
        created_at=meeting.created_at
    )

@router.post("/{meeting_id}/summarize", response_model=MeetingResponse)
async def summarize_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Meeting)
        .options(
            selectinload(Meeting.action_items),
            selectinload(Meeting.key_decisions)
        )
        .where(Meeting.id == meeting_id, Meeting.user_id == current_user.id)
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting tidak ditemukan")

    if not meeting.raw_transcript:
        raise HTTPException(status_code=400, detail="Transkrip belum tersedia")

    if meeting.status == "done":
        raise HTTPException(status_code=400, detail="Meeting sudah dianalisis")

    try:
        from app.core.gemini import analyze_meeting
        import asyncio

        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            None, analyze_meeting, meeting.raw_transcript
        )

        meeting.summary = analysis.get("summary", "")
        meeting.status = "done"
        await db.commit()

        for item in analysis.get("action_items", []):
            action = ActionItem(
                meeting_id=meeting.id,
                description=item.get("description", ""),
                assignee=item.get("assignee"),
                due_date=item.get("due_date")
            )
            db.add(action)

        for decision in analysis.get("key_decisions", []):
            kd = KeyDecision(
                meeting_id=meeting.id,
                description=decision.get("description", "")
            )
            db.add(kd)

        await db.commit()

        await db.refresh(meeting)
        result2 = await db.execute(
            select(Meeting)
            .options(
                selectinload(Meeting.action_items),
                selectinload(Meeting.key_decisions)
            )
            .where(Meeting.id == meeting_id)
        )
        meeting = result2.scalar_one()

        return MeetingResponse(
            id=str(meeting.id),
            title=meeting.title,
            status=meeting.status,
            summary=meeting.summary,
            raw_transcript=meeting.raw_transcript,
            language=meeting.language,
            meeting_date=meeting.meeting_date,
            created_at=meeting.created_at,
            action_items=[
                {"id": str(a.id), "description": a.description,
                 "assignee": a.assignee, "due_date": a.due_date, "is_done": a.is_done}
                for a in meeting.action_items
            ],
            key_decisions=[
                {"id": str(k.id), "description": k.description}
                for k in meeting.key_decisions
            ]
        )

    except Exception as e:
        meeting.status = "error"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Gagal menganalisis meeting: {str(e)}")
    
async def process_meeting(meeting_id: str, file_path: str, ext: str):
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Meeting).where(Meeting.id == meeting_id)
            )
            meeting = result.scalar_one_or_none()
            if not meeting:
                return

            if ext == ".pdf":
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                transcript = " ".join([
                    page.extract_text() for page in reader.pages
                    if page.extract_text()
                ])
            elif ext == ".txt":
                async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                    transcript = await f.read()
            else:
                loop = asyncio.get_event_loop()
                transcript = await loop.run_in_executor(
                    None, transcribe_audio, file_path
                )

            meeting.raw_transcript = transcript
            meeting.status = "transcribed"
            await db.commit()
            print(f"Meeting {meeting_id} transcribed successfully")

        except Exception as e:
            print(f"Error processing meeting {meeting_id}: {e}")
            result = await db.execute(
                select(Meeting).where(Meeting.id == meeting_id)
            )
            meeting = result.scalar_one_or_none()
            if meeting:
                meeting.status = "error"
                await db.commit()

@router.get("/", response_model=list[MeetingResponse])
async def list_meetings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Meeting)
        .where(Meeting.user_id == current_user.id)
        .order_by(Meeting.created_at.desc())
    )
    meetings = result.scalars().all()
    return [
        MeetingResponse(
            id=str(m.id),
            title=m.title,
            status=m.status,
            summary=m.summary,
            raw_transcript=m.raw_transcript,
            language=m.language,
            meeting_date=m.meeting_date,
            created_at=m.created_at
        ) for m in meetings
    ]

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Meeting)
        .options(
            selectinload(Meeting.action_items),
            selectinload(Meeting.key_decisions)
        )
        .where(Meeting.id == meeting_id, Meeting.user_id == current_user.id)
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting tidak ditemukan")

    return MeetingResponse(
        id=str(meeting.id),
        title=meeting.title,
        status=meeting.status,
        summary=meeting.summary,
        raw_transcript=meeting.raw_transcript,
        language=meeting.language,
        meeting_date=meeting.meeting_date,
        created_at=meeting.created_at,
        action_items=[
            {"id": str(a.id), "description": a.description,
             "assignee": a.assignee, "due_date": a.due_date, "is_done": a.is_done}
            for a in meeting.action_items
        ],
        key_decisions=[
            {"id": str(k.id), "description": k.description}
            for k in meeting.key_decisions
        ]
    )

@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id, Meeting.user_id == current_user.id)
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting tidak ditemukan")

    if meeting.file_url and os.path.exists(meeting.file_url):
        os.remove(meeting.file_url)

    await db.delete(meeting)
    await db.commit()