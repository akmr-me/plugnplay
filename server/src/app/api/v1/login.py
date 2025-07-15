from datetime import timedelta
from typing import Annotated, Optional
import uuid

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime, timezone  # Import datetime and timezone
from pydantic import BaseModel
from jose import jwt, jwk, JWTError
from jose.utils import base64url_decode


from ...core.config import settings
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import UnauthorizedException
from ...core.schemas import Token
from ...core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    TokenType,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_jwks,
    sync_user_to_db,
)

router = APIRouter(tags=["login"])


class UserInfo(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    image_url: Optional[str] = None


class LoginSuccessResponse(BaseModel):
    message: str
    user: UserInfo


class LoginRequest(BaseModel):
    fullname: str
    id: str
    imageUrl: Optional[str] = None
    lastSignInAt: datetime
    email: str
    createdAt: datetime


security = HTTPBearer()


@router.post(
    "/login",
)
async def login_with_provider_data(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(async_get_db),
    token=Depends(security),
):
    print(body)
    token_str = token.credentials
    jwks = await get_jwks()
    unverified_header = jwt.get_unverified_header(token_str)
    kid = unverified_header["kid"]

    key_data = next((k for k in jwks if k["kid"] == kid), None)
    if key_data is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    public_key = jwk.construct(key_data)
    message, encoded_signature = token_str.rsplit(".", 1)
    decoded_signature = base64url_decode(encoded_signature.encode())

    if not public_key.verify(message.encode(), decoded_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = jwt.decode(
            token_str,
            public_key.to_pem().decode(),
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token decoding failed")

    # Match sub (user_id in token) with body
    if payload["sub"] != body.id:
        raise HTTPException(
            status_code=401, detail="User ID mismatch between token and body"
        )

    # Sync user
    user = await sync_user_to_db(
        user_id=body.id,
        email=body.email,
        full_name=body.fullname,
        image_url=body.imageUrl,
        last_sign_in_at=body.lastSignInAt,
        created_at=body.createdAt,
        db=db,
    )

    return {
        "message": "User login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "image_url": user.image_url,
        },
    }


@router.post("/refresh")
async def refresh_access_token(
    request: Request, db: AsyncSession = Depends(async_get_db)
) -> dict[str, str]:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedException("Refresh token missing.")

    user_data = await verify_token(refresh_token, TokenType.REFRESH, db)
    if not user_data:
        raise UnauthorizedException("Invalid refresh token.")

    new_access_token = await create_access_token(
        data={"sub": user_data.username_or_email}
    )
    return {"access_token": new_access_token, "token_type": "bearer"}
