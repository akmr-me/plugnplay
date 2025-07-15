from datetime import UTC, datetime, timedelta, timezone
from enum import Enum
from typing import Any, Literal, cast, Optional
import httpx

import bcrypt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..crud.crud_users import crud_users
from .config import settings
from .db.crud_token_blacklist import crud_token_blacklist
from .schemas import TokenBlacklistCreate, TokenData
from .db.database import async_get_db

from ..models.user import User

SECRET_KEY: SecretStr = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

CLERK_JWKS_URL = settings.CLERK_JWKS_URL

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    correct_password: bool = bcrypt.checkpw(
        plain_password.encode(), hashed_password.encode()
    )
    return correct_password


def get_password_hash(password: str) -> str:
    hashed_password: str = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    return hashed_password


async def authenticate_user(
    username_or_email: str, password: str, db: AsyncSession
) -> dict[str, Any] | Literal[False]:
    if "@" in username_or_email:
        db_user = await crud_users.get(db=db, email=username_or_email, is_deleted=False)
    else:
        db_user = await crud_users.get(
            db=db, username=username_or_email, is_deleted=False
        )

    if not db_user:
        return False

    db_user = cast(dict[str, Any], db_user)
    if not await verify_password(password, db_user["hashed_password"]):
        return False

    return db_user


async def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC).replace(tzinfo=None) + expires_delta
    else:
        expire = datetime.now(UTC).replace(tzinfo=None) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "token_type": TokenType.ACCESS})
    encoded_jwt: str = jwt.encode(
        to_encode, SECRET_KEY.get_secret_value(), algorithm=ALGORITHM
    )
    return encoded_jwt


async def create_refresh_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC).replace(tzinfo=None) + expires_delta
    else:
        expire = datetime.now(UTC).replace(tzinfo=None) + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    to_encode.update({"exp": expire, "token_type": TokenType.REFRESH})
    encoded_jwt: str = jwt.encode(
        to_encode, SECRET_KEY.get_secret_value(), algorithm=ALGORITHM
    )
    return encoded_jwt


async def verify_token(
    token: str, expected_token_type: TokenType, db: AsyncSession
) -> TokenData | None:
    """Verify a JWT token and return TokenData if valid.

    Parameters
    ----------
    token: str
        The JWT token to be verified.
    expected_token_type: TokenType
        The expected type of token (access or refresh)
    db: AsyncSession
        Database session for performing database operations.

    Returns
    -------
    TokenData | None
        TokenData instance if the token is valid, None otherwise.
    """
    is_blacklisted = await crud_token_blacklist.exists(db, token=token)
    if is_blacklisted:
        return None

    try:
        payload = jwt.decode(
            token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM]
        )
        username_or_email: str | None = payload.get("sub")
        token_type: str | None = payload.get("token_type")

        if username_or_email is None or token_type != expected_token_type:
            return None

        return TokenData(username_or_email=username_or_email)

    except JWTError:
        return None


async def blacklist_tokens(
    access_token: str, refresh_token: str, db: AsyncSession
) -> None:
    """Blacklist both access and refresh tokens.

    Parameters
    ----------
    access_token: str
        The access token to blacklist
    refresh_token: str
        The refresh token to blacklist
    db: AsyncSession
        Database session for performing database operations.
    """
    for token in [access_token, refresh_token]:
        payload = jwt.decode(
            token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM]
        )
        exp_timestamp = payload.get("exp")
        if exp_timestamp is not None:
            expires_at = datetime.fromtimestamp(exp_timestamp)
            await crud_token_blacklist.create(
                db, object=TokenBlacklistCreate(token=token, expires_at=expires_at)
            )


async def blacklist_token(token: str, db: AsyncSession) -> None:
    payload = jwt.decode(token, SECRET_KEY.get_secret_value(), algorithms=[ALGORITHM])
    exp_timestamp = payload.get("exp")
    if exp_timestamp is not None:
        expires_at = datetime.fromtimestamp(exp_timestamp)
        await crud_token_blacklist.create(
            db, object=TokenBlacklistCreate(token=token, expires_at=expires_at)
        )


async def sync_user_to_db(
    user_id: str,
    email: str,
    db: AsyncSession,
    last_sign_in_at: datetime = datetime.now(timezone.utc),
    image_url: Optional[str] = None,
    full_name: Optional[str] = None,
    created_at: Optional[datetime] = None,
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            user_id=user_id,
            email=email,
            image_url=image_url,
            full_name=full_name,
            last_sign_in_at=last_sign_in_at,
            created_at=created_at,
        )
        db.add(user)
        await db.commit()
    return user


async def get_jwks():
    async with httpx.AsyncClient() as client:
        resp = await client.get(CLERK_JWKS_URL)
        return resp.json()["keys"]
