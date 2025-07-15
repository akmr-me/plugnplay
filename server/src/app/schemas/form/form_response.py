from typing import Annotated
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# === Base schema ===
class FormResponseBase(BaseModel):
    pass  # Add common fields if needed later


# === Read schema ===
class FormResponseRead(FormResponseBase):
    id: UUID
    form_id: UUID
    submitted_at: datetime


# === Create schema ===
class FormResponseCreate(FormResponseBase):
    model_config = ConfigDict(extra="forbid")
    form_id: UUID


# === Internal Create with defaults like created_by_user_id if needed
class FormResponseCreateInternal(FormResponseCreate):
    pass  # Add internal-only fields here if needed


# === Update schema ===
class FormResponseUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    # Possibly only editable fields, if any
