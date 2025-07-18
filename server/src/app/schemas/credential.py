import enum

from typing import Optional, Annotated, List
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class CredentialType(str, enum.Enum):
    bearer = "bearer-token"
    custom = "custom-token"
    api_key = "api-key"
    basic = "basic-auth"
    google_oauth = "google-oauth"


# === Base schema ===
class CredentialBase(BaseModel):
    name: Annotated[str, Field(min_length=3, max_length=100)]
    description: Optional[str] = Field(default=None, max_length=300)
    type: CredentialType

    # Optional fields depending on type
    bearer_token: Optional[str] = None

    custom_token: Optional[str] = None

    api_key_name: Optional[str] = None
    api_key_value: Optional[str] = None

    basic_username: Optional[str] = None
    basic_password: Optional[str] = None

    oauth_client_id: Optional[str] = None
    oauth_client_secret: Optional[str] = None
    oauth_refresh_token: Optional[str] = None
    oauth_scopes: Optional[List[str]] = None


class CredentialCreate(CredentialBase):
    model_config = ConfigDict(extra="forbid")


class CredentialCreateInternal(CredentialCreate):
    user_id: str


class CredentialRead(CredentialBase):
    id: UUID
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CredentialUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, min_length=3, max_length=100)
    description: Optional[str] = Field(default=None, max_length=300)
    type: Optional[CredentialType] = None

    bearer_token: Optional[str] = None
    custom_token: Optional[str] = None
    api_key_name: Optional[str] = None
    api_key_value: Optional[str] = None
    basic_username: Optional[str] = None
    basic_password: Optional[str] = None
    oauth_client_id: Optional[str] = None
    oauth_client_secret: Optional[str] = None
    oauth_refresh_token: Optional[str] = None
    oauth_scopes: Optional[List[str]] = None


class CredentialDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
