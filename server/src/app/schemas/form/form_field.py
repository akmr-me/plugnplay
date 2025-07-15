from typing import Annotated, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# === Base schema ===
class FormFieldBase(BaseModel):
    label: Annotated[
        str, Field(min_length=0, max_length=100, examples=["First name"], default="")
    ]
    type: Annotated[
        str, Field(pattern="^(text|email|number|textarea|date)$", examples=["text"])
    ]
    placeholder: Annotated[
        str | None, Field(default="", examples=["Enter your first name"])
    ]
    required: Annotated[bool, Field(default=False)]
    position: int


# === Read schema ===
class FormFieldRead(FormFieldBase):
    id: UUID
    form_id: UUID
    created_at: datetime


# === Create schema ===
class FormFieldCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Annotated[
        str, Field(pattern="^(text|email|number|textarea|date)$", examples=["text"])
    ]
    required: Annotated[bool, Field(default=False)]
    position: int


# === Internal Create with defaults like created_by_user_id if needed
class FormFieldCreateInternal(FormFieldBase):
    form_id: UUID
    # pass


# === Update schema ===
class FormFieldUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: Optional[str] = Field(default=None)
    placeholder: Optional[str] = Field(default=None)
    required: Optional[bool] = Field(default=None)
    position: Optional[int] = None


# === Soft Delete or Restore (if needed)
class FormFieldDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
