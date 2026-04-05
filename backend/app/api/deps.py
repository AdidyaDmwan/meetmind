from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
import httpx

bearer = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials

    # Coba verifikasi sebagai JWT biasa dulu
    payload = decode_token(token)

    if payload:
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        if user:
            return user

    # Kalau gagal, coba verifikasi sebagai Clerk token
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.clerk.com/v1/tokens/verify",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                clerk_user = res.json()
                clerk_id = clerk_user.get("sub")
                email = clerk_user.get("email", "")

                # Cari atau buat user berdasarkan clerk_id atau email
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()

                if not user:
                    user = User(
                        name=clerk_user.get("name", email.split("@")[0]),
                        email=email,
                        hashed_password=""
                    )
                    db.add(user)
                    await db.commit()
                    await db.refresh(user)

                return user
    except Exception:
        pass

    raise HTTPException(status_code=401, detail="Token tidak valid")