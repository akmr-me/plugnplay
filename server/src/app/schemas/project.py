from typing import Annotated
from datetime import datetime
import uuid

from pydantic import BaseModel, Field, ConfigDict

from app.core.schemas import PersistentDeletion, TimestampSchema, UUIDSchema


class ProjectBase(BaseModel):
    name: Annotated[str, Field(min_length=3, max_length=50, examples=["First project"])]
    description: Annotated[
        str,
        Field(min_length=5, max_length=100, examples=["This is project description."]),
    ]


class Project(TimestampSchema, ProjectBase, PersistentDeletion, UUIDSchema):
    user_id: str


class ProjectRead(BaseModel):
    id: uuid.UUID
    name: Annotated[str, Field(min_length=3, max_length=50, examples=["First project"])]
    description: Annotated[
        str,
        Field(min_length=5, max_length=100, examples=["This is project description."]),
    ]
    user_id: str
    created_at: datetime


class ProjectCreate(ProjectBase):
    model_config = ConfigDict(extra="forbid")  # hides the extra field in request
    pass


class ProjectCreateInternal(ProjectCreate):
    user_id: str


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Annotated[
        str | None,
        Field(
            min_length=3,
            max_length=50,
            examples=["Updated project"],
            default=None,
        ),
    ]
    description: Annotated[
        str | None,
        Field(
            min_length=5,
            max_length=100,
            examples=["This is the updated project description."],
            default=None,
        ),
    ]


class ProjectUpdateInternal(ProjectUpdate):
    updated_at: datetime


class ProjectDelete(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_deleted: bool
    deleted_at: datetime
