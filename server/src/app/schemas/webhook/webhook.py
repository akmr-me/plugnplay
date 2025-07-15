from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
import enum

from app.models.credential import Credential


# === Enums ===
class AuthType(str, enum.Enum):
    NONE = "none"
    BEARER = "bearer-token"
    API_KEY = "api-key"
    BASIC = "basic-auth"


class HTTPMethod(str, enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"


# === Base schema ===
class WebhookBase(BaseModel):
    path: str = Field(..., max_length=100, examples=["/trigger/action"])
    method: HTTPMethod = Field(default=HTTPMethod.POST, examples=["POST"])
    auth_type: AuthType = Field(default=AuthType.NONE, examples=["none"])
    credential_id: Optional[UUID] = Field(default=None, examples=["uuid-credential"])

    class Config:
        use_enum_values = True


# === Create schema ===
class WebhookCreate(WebhookBase):
    model_config = ConfigDict(extra="forbid")


# === Internal Create schema (for including wrokflow_id and id) ===
class WebhookCreateInternal(WebhookCreate):
    id: UUID
    workflow_id: UUID


# === Update schema ===
class WebhookUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: Optional[str] = Field(default=None, max_length=100)
    method: Optional[HTTPMethod] = None
    auth_type: Optional[AuthType] = None
    credential_id: Optional[UUID] = None


# === Read schema ===
class WebhookRead(WebhookBase):
    id: UUID
    workflow_id: UUID
    created_at: datetime
    is_deleted: bool
    credentials: Optional[Credential]

    class Config:
        from_attributes = True


# === Soft Delete schema ===
class WebhookDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
