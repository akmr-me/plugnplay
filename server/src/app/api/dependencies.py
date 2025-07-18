from typing import Annotated, Any, cast


from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer

from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.db.database import async_get_db
from ..core.exceptions.http_exceptions import (
    ForbiddenException,
    RateLimitException,
    UnauthorizedException,
)
from ..core.logger import logging
from ..core.security import TokenType, oauth2_scheme, verify_token
from ..core.utils.rate_limit import rate_limiter
from ..crud.crud_rate_limit import crud_rate_limits
from ..crud.crud_tier import crud_tiers
from ..crud.crud_users import crud_users
from ..schemas.rate_limit import RateLimitRead, sanitize_path
from ..schemas.tier import TierRead
from ..core.security import get_jwks, sync_user_to_db

logger = logging.getLogger(__name__)

DEFAULT_LIMIT = settings.DEFAULT_RATE_LIMIT_LIMIT
DEFAULT_PERIOD = settings.DEFAULT_RATE_LIMIT_PERIOD
CLERK_JWKS_URL = settings.CLERK_JWKS_URL


security = HTTPBearer()


async def get_current_user(
    request: Request, token=Depends(security), db: AsyncSession = Depends(async_get_db)
):
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
        raise HTTPException(status_code=401, detail="Token signature invalid")

    try:
        payload = jwt.decode(
            token_str,
            public_key.to_pem().decode(),
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid")

    # Extract user info
    user_id = payload["sub"]
    email = payload.get("email")
    print(email)
    # Optionally sync user in DB
    user = await sync_user_to_db(user_id, email, db)

    return user


async def get_current_user_from_token(
    token_str: str, db: AsyncSession = Depends(async_get_db)
):
    if not token_str:
        raise HTTPException(status_code=401, detail="Token missing")

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
        raise HTTPException(status_code=401, detail="Token signature invalid")

    try:
        payload = jwt.decode(
            token_str,
            public_key.to_pem().decode(),
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid")

    # Extract user info
    user_id = payload["sub"]
    email = payload.get("email")
    print(email)
    # Optionally sync user in DB
    user = await sync_user_to_db(user_id, email, db)

    return user


class FakeToken:
    def __init__(self, credentials: str):
        self.credentials = credentials


async def get_optional_user(
    request: Request, db: AsyncSession = Depends(async_get_db)
) -> dict | None:
    token = request.headers.get("Authorization")
    if not token:
        return None

    try:
        token_type, _, token_value = token.partition(" ")
        if token_type.lower() != "bearer" or not token_value:
            return None

        # token_data = await verify_token(token_value, TokenType.ACCESS, db)
        # if token_data is None:
        #     return None
        token_obj = FakeToken(token_value)
        return await get_current_user(request, token=token_obj, db=db)

    except HTTPException as http_exc:
        print(103, http_exc)
        if http_exc.status_code != 401:
            logger.error(
                f"Unexpected HTTPException in get_optional_user: {http_exc.detail}"
            )
        return None

    except Exception as exc:
        logger.error(f"Unexpected error in get_optional_user: {exc}")
        return None


async def get_current_superuser(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if not current_user["is_superuser"]:
        raise ForbiddenException("You do not have enough privileges.")

    return current_user


async def rate_limiter_dependency(
    request: Request,
    db: Annotated[AsyncSession, Depends(async_get_db)],
    user: dict | None = Depends(get_optional_user),
) -> None:
    if hasattr(request.app.state, "initialization_complete"):
        await request.app.state.initialization_complete.wait()

    path = sanitize_path(request.url.path)
    if user:
        user_id = user["id"]
        tier = await crud_tiers.get(db, id=user["tier_id"], schema_to_select=TierRead)
        if tier:
            tier = cast(TierRead, tier)
            rate_limit = await crud_rate_limits.get(
                db=db, tier_id=tier.id, path=path, schema_to_select=RateLimitRead
            )
            if rate_limit:
                rate_limit = cast(RateLimitRead, rate_limit)
                limit, period = rate_limit.limit, rate_limit.period
            else:
                logger.warning(
                    f"User {user_id} with tier '{tier.name}' has no specific rate limit for path '{path}'. \
                        Applying default rate limit."
                )
                limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD
        else:
            logger.warning(
                f"User {user_id} has no assigned tier. Applying default rate limit."
            )
            limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD
    else:
        user_id = request.client.host if request.client else "unknown"
        limit, period = DEFAULT_LIMIT, DEFAULT_PERIOD

    is_limited = await rate_limiter.is_rate_limited(
        db=db, user_id=user_id, path=path, limit=limit, period=period
    )
    if is_limited:
        raise RateLimitException("Rate limit exceeded.")
