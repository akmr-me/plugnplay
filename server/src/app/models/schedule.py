from datetime import datetime, UTC
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.core.db.database import Base  # Adjust this import as needed


class ScheduleType(str, enum.Enum):
    INTERVAL = "interval"
    CRON = "cron"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ONCE = "once"


class Schedule(Base):
    __tablename__ = "schedule"

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "workflow.id", ondelete="CASCADE"
        ),  # Make sure your workflow table has `uuid` column
        index=True,
        nullable=False,
    )
    run_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        # init=False,
        nullable=False,
        unique=True,
    )

    schedule_type: Mapped[ScheduleType] = mapped_column(
        Enum(ScheduleType), nullable=False, default=ScheduleType.ONCE
    )

    # For 'once' type, store a specific run time

    # Additional fields can be added for `cron`, `interval`, etc. if enabled in future

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
