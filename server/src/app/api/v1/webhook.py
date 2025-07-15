from typing import Annotated, Any, cast
from uuid import UUID
from datetime import datetime, UTC
import base64
import json

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession  # type: ignore
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...api.dependencies import get_optional_user, get_current_user
from ...core.db.database import async_get_db
from ...core.exceptions.http_exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
)
from ...core.utils.cache import cache
from ...crud.crud_users import crud_users
from ...crud.form.form_field import crud_form_fields
from ...crud.webhook.crud_webhooks import crud_webhooks
from ...crud.form.form_response import crud_form_responses
from ...crud.form.form_response_value import crud_form_response_values
from ...schemas.webhook.webhook import (
    WebhookCreate,
    WebhookCreateInternal,
    WebhookRead,
    WebhookUpdate,
)
from ...models.webhook.webhook import Webhook, AuthType
from app.models.webhook.webhook_response import WebhookResponse

from app.services.generate_form_html import generate_form_html
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# security = HTTPBearer()


router = APIRouter(tags=["webhooks"])


# -------------------------------------------Webhook----------------------------------------------------


@router.get("/webhook/{workflow_id}", response_model=WebhookRead, status_code=201)
async def get_webhook(
    request: Request,
    workflow_id: str,
    # webhook: WebhookUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> WebhookRead:
    # Check if workflow belongs to user or not

    # If form already exits return all data
    stmt = (
        select(Webhook)
        .where(Webhook.id == workflow_id)
        .options(selectinload(Webhook.credentials))
    )

    result = await db.execute(stmt)
    webhook_with_fields = result.scalar_one_or_none()
    webhook_read = WebhookRead.model_validate(webhook_with_fields, from_attributes=True)

    if webhook_read:
        return cast(WebhookRead, webhook_read)

    if webhook_read is None:
        raise NotFoundException("Webhook not found")

    return cast(WebhookRead, webhook_read)


@router.post("/webhook/{workflow_id}", status_code=201)
async def create_webhook(
    request: Request,
    workflow_id: str,
    webhook: WebhookCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:
    # Check if workflow belongs to user or not

    # If form already exits return all data
    webhook_read = await crud_webhooks.get(
        db=db, id=workflow_id, schema_to_select=WebhookRead
    )

    if webhook_read:
        update_data = webhook.model_dump(exclude_unset=True)
        if not update_data:
            raise BadRequestException(
                status_code=400, detail="No valid fields to update."
            )

        await crud_webhooks.update(db=db, object=update_data, id=workflow_id)
        webhook_read = await crud_webhooks.get(
            db=db, id=workflow_id, schema_to_select=WebhookRead
        )
        if not webhook_read:
            raise NotFoundException("Updated workflow not found")
        return {"message": "Webhook Updated!"}
    print("webhook", webhook)
    webhook_internal_dict = webhook.model_dump()
    webhook_internal_dict["workflow_id"] = workflow_id
    webhook_internal_dict["id"] = UUID(workflow_id)
    print(webhook_internal_dict)
    webhook_internal = WebhookCreateInternal(**webhook_internal_dict)
    created_webhook = await crud_webhooks.create(db=db, object=webhook_internal)

    webhook_read = await crud_webhooks.get(
        db=db, id=created_webhook.id, schema_to_select=WebhookRead
    )
    if webhook_read is None:
        raise NotFoundException("Created workflow not found")

    return {"message": "Webhook Created!"}


# Using post for both
@router.patch("/webhook/{webhook_id}")
async def update_webhook(
    webhook_id: str,
    update: WebhookUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> dict:

    webhook_read = await crud_webhooks.get(
        db=db, id=webhook_id, schema_to_select=WebhookRead
    )
    if webhook_read is None:
        raise NotFoundException("Webhook not found")

    # Prepare update
    update_data = update.model_dump(exclude_unset=True)
    if not update_data:
        raise BadRequestException(status_code=400, detail="No valid fields to update.")

    updated_form = await crud_webhooks.update(db=db, object=update_data, id=update.id)

    return {"message": "Post updated"}


@router.delete(
    "/form/{workflow_id}",
    status_code=204,
)
async def delete_form(
    request: Request,
    workflow_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
):
    # ✅ Optionally: Check if form and field belong to the current user's workflow
    webhook_read = await crud_webhooks.get(
        db=db, id=workflow_id, schema_to_select=WebhookRead
    )

    if webhook_read is None:
        raise NotFoundException("Form not found")

    await webhook_read.db_delete(db=db, id=workflow_id)

    # HTTP 204 = No Content (typical for DELETE success)
    return Response(status_code=204)


# ---------------------------------------------------EVENTS------------------------------------------------------------


@router.api_route("/webhooks/{webhook_id}/events", methods=["POST", "GET"])
async def handle_external_webhook(
    webhook_id: UUID,
    request: Request,
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> Response:

    # 1. Fetch webhook
    stmt = (
        select(Webhook)
        .where(Webhook.id == webhook_id)
        .options(selectinload(Webhook.credentials))
    )
    result = await db.execute(stmt)
    webhook = result.scalar_one_or_none()

    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    if request.method.upper() != webhook.method.value:
        raise HTTPException(
            status_code=405,
            detail=f"Method {request.method} not allowed for this webhook. Expected {webhook.method.value}",
        )

    # 2. Auth check
    def unauthorized(detail="Unauthorized"):
        raise HTTPException(status_code=403, detail=detail)

    if webhook.auth_type != AuthType.NONE:
        auth_header = request.headers.get("Authorization")

        if webhook.auth_type == AuthType.BEARER:
            expected = f"Bearer {webhook.credentials.bearer_token}"
            if not auth_header or auth_header != expected:
                return unauthorized("Invalid Bearer token")

        elif webhook.auth_type == AuthType.API_KEY:
            api_key = request.headers.get("x-api-key")
            if not api_key or api_key != webhook.credentials.api_key:
                return unauthorized("Invalid API key")

        elif webhook.auth_type == AuthType.BASIC:
            if not auth_header or not auth_header.startswith("Basic "):
                return unauthorized("Missing or malformed Basic Auth")

            try:
                encoded = auth_header.split(" ")[1]
                decoded = base64.b64decode(encoded).decode("utf-8")
                username, password = decoded.split(":", 1)
                if (
                    username != webhook.credentials.basic_username
                    or password != webhook.credentials.basic_password
                ):
                    return unauthorized("Basic Auth credentials mismatch")
            except Exception:
                return unauthorized("Invalid Basic Auth header")

    # 3. Validate Content-Type header
    content_type = request.headers.get("Content-Type", "").lower()
    if "application/json" not in content_type:
        raise HTTPException(
            status_code=415, detail="Only 'application/json' is supported"
        )

    # 4. Parse and store JSON body
    try:
        body = await request.json()
        json_body_str = json.dumps(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    print("json_body_str", json_body_str)
    # Trigger graph

    response_record = WebhookResponse(
        webhook_id=webhook.id,
        status_code=200,
        response_body=json_body_str,
        # timestamp=datetime.now(UTC),
    )
    db.add(response_record)
    await db.commit()

    return JSONResponse(content={"message": "Webhook received"}, status_code=200)
