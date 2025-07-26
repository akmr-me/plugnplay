from typing import Annotated, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
import enum


# === Enum for schedule types ===
class ScheduleType(str, enum.Enum):
    interval = "interval"
    cron = "cron"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    once = "once"


# === Base schema ===
class ScheduleBase(BaseModel):
    schedule_type: ScheduleType = Field(examples=["once"])
    run_at: Optional[datetime] = Field(
        default=None, examples=["2025-07-12T18:00:00Z"]
    )  # Only required for 'once'


# === Read schema ===
class ScheduleRead(ScheduleBase):
    id: UUID
    workflow_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    is_deleted: bool
    is_active: bool

    class Config:
        from_attributes = True


# === Create schema ===
class ScheduleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schedule_type: ScheduleType
    # is_active: bool
    # timezone: str
    run_at: Optional[datetime] = None  # only required if schedule_type is "once"


# === Internal create schema (e.g., include workflow_id) ===
class ScheduleCreateInternal(ScheduleCreate):
    workflow_id: UUID
    id: UUID


# === Update schema ===
class ScheduleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schedule_type: Optional[ScheduleType] = None
    run_at: Optional[datetime] = None
    is_active: Optional[bool] = None


# === Soft Delete schema ===
class ScheduleDelete(BaseModel):
    is_deleted: bool
    deleted_at: datetime
