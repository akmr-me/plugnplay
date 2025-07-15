from fastapi import APIRouter, Depends, Request, Response
from typing import Annotated, Any, cast
from datetime import datetime

# from pytz import timezone
from zoneinfo import ZoneInfo

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.credential import (
    CredentialRead,
    CredentialCreateInternal,
    CredentialUpdate,
    CredentialCreate,
)
from ...schemas.user import UserRead
from ...crud.crud_credentials import crud_credentials
from ...crud.crud_users import crud_users

from ...api.dependencies import get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
)


router = APIRouter(tags=["credentials"])


@router.get("/credential/{user_id}")
async def get_credentials(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):

    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_credentials = await crud_credentials.get_multi(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=CredentialRead
    )

    if db_credentials is None:
        raise NotFoundException("No credential found")
    print(db_credentials)
    credentials = [
        CredentialRead.model_validate(obj, from_attributes=True)
        for obj in db_credentials["data"]
    ]

    return credentials


@router.post("/credential/{user_id}", response_model=CredentialRead, status_code=201)
async def create_credential(
    request: Request,
    user_id: str,
    credential: CredentialCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CredentialRead:

    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    print("user verified")

    credential_internal_dict = credential.model_dump()
    credential_internal_dict["user_id"] = user_id
    print(credential_internal_dict)
    credential_internal = CredentialCreateInternal(**credential_internal_dict)
    created_credential = await crud_credentials.create(
        db=db, object=credential_internal
    )
    print("created_credential", created_credential)
    db_credential = await crud_credentials.get(
        db=db, id=created_credential.id, schema_to_select=CredentialRead
    )
    print("db_credential", db_credential)
    if created_credential is None:
        raise NotFoundException("Created credential not found")

    return cast(CredentialRead, db_credential)


@router.patch(
    "/credential/{user_id}/{credential_id}",
    response_model=CredentialRead,
    status_code=201,
)
async def update_credential(
    request: Request,
    user_id: str,
    credential: CredentialCreate,
    credential_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> CredentialRead:

    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    print("user verified")
    db_credentials = await crud_credentials.get(
        db=db, id=credential_id, is_deleted=False, schema_to_select=CredentialRead
    )

    if not db_credentials:
        raise NotFoundException("Credential not found")

    print("db_credentials", db_credentials)
    update_data = credential.model_dump(exclude_unset=True)
    await crud_credentials.update(
        db=db,
        object=update_data,
        id=credential_id,
    )

    db_credential = await crud_credentials.get(
        db=db, id=credential_id, schema_to_select=CredentialRead
    )

    return cast(CredentialRead, db_credential)


@router.delete(
    "/credential/{user_id}/{credential_id}",
    status_code=204,
)
async def delete_credentials(
    request: Request,
    user_id: str,
    credential_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):

    db_user = await crud_users.get(
        db=db, user_id=user_id, is_deleted=False, schema_to_select=UserRead
    )
    if not db_user:
        raise NotFoundException("User not found")

    db_user = cast(UserRead, db_user)

    if current_user.user_id != db_user["user_id"]:
        raise ForbiddenException()

    db_credentials = await crud_credentials.get(
        db=db, id=credential_id, is_deleted=False, schema_to_select=CredentialRead
    )

    if db_credentials is None:
        print("credential not found", credential_id)
        raise NotFoundException("Credential not found")

    await crud_credentials.db_delete(db=db, id=credential_id)

    # HTTP 204 = No Content (typical for DELETE success)
    return Response(status_code=204)
