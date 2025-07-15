from typing import Annotated
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# === Base schema ===
class FormResponseValueBase(BaseModel):
    value: str | None = None


# === Read schema ===
class FormResponseValueRead(FormResponseValueBase):
    id: UUID
    response_id: UUID
    field_id: UUID


# === Create schema ===
class FormResponseValueCreate(FormResponseValueBase):
    model_config = ConfigDict(extra="forbid")

    response_id: UUID
    field_id: UUID


# === Internal Create with defaults like created_by_user_id if needed
class FormResponseValueCreateInternal(FormResponseValueCreate):
    pass  # Extend if needed


# === Update schema ===
class FormResponseValueUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: str | None = None
