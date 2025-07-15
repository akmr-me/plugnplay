from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# === Base Schema ===
class WebhookResponseBase(BaseModel):
    status_code: int = Field(..., examples=[200])
    response_body: str = Field(..., examples=['{"success": true}'])
    timestamp: datetime = Field(..., examples=["2025-07-13T12:00:00Z"])


# === Create Schema ===
class WebhookResponseCreate(WebhookResponseBase):
    model_config = ConfigDict(extra="forbid")


# === Internal Create Schema ===
class WebhookResponseCreateInternal(WebhookResponseCreate):
    id: UUID
    webhook_id: UUID


# === Read Schema ===
class WebhookResponseRead(WebhookResponseBase):
    id: UUID
    webhook_id: UUID

    class Config:
        from_attributes = True


class WebhookResponseDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
