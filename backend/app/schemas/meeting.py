from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MeetingCreate(BaseModel):
    title: str
    meeting_date: Optional[datetime] = None

class ActionItemResponse(BaseModel):
    id: str
    description: str
    assignee: Optional[str]
    due_date: Optional[str]
    is_done: bool

    class Config:
        from_attributes = True

class KeyDecisionResponse(BaseModel):
    id: str
    description: str

    class Config:
        from_attributes = True

class MeetingResponse(BaseModel):
    id: str
    title: str
    status: str
    summary: Optional[str]
    raw_transcript: Optional[str]
    language: str
    meeting_date: Optional[datetime]
    created_at: datetime
    action_items: list[ActionItemResponse] = []
    key_decisions: list[KeyDecisionResponse] = []

    class Config:
        from_attributes = True