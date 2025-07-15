from typing import Annotated, Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from ..form.form_field import FormFieldCreate, FormFieldRead


# === Base schema ===
class FormBase(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=100, examples=["First form"])]
    description: Annotated[
        str,
        Field(
            min_length=1,
            max_length=200,
            examples=["This is First testing form description"],
        ),
    ]


# === Read schema ===
class FormRead(FormBase):
    id: UUID
    workflow_id: UUID
    created_at: datetime
    title: str
    description: str
    # fields: Optional[list[FormFieldCreate]] = Field(default=None, exclude=True)
    fields: List[FormFieldRead] = []  # ✅ Include this

    class Config:
        from_attributes = True


# === Create schema ===
# class FormCreate(FormBase):
#     workflow_id: UUID


class FormCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Annotated[str, Field(min_length=3, max_length=100)]
    description: Annotated[str, Field(min_length=0, max_length=500)]
    # fields: list[FormFieldCreate]


# === Internal Create with defaults like created_by_user_id if needed
class FormCreateInternal(FormCreate):
    # fields: Optional[list[FormFieldCreate]] = Field(default=None, exclude=True)
    workflow_id: UUID
    id: UUID
    # pass


# === Update schema ===
class FormUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = Field(default=None, min_length=3, max_length=100)
    description: Optional[str] = Field(default=None, min_length=0, max_length=500)


# === Soft Delete or Restore (if needed)
class FormDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
