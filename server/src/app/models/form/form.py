from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime, func  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.db.database import Base
from .form_fields import FormField


class Form(Base):
    __tablename__ = "form"

    # Columns with init=False are not part of the __init__ signature,
    # so their order relative to other fields doesn't matter for this error.
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workflow.id", ondelete="CASCADE"), index=True, nullable=False
    )
    fields: Mapped[list["FormField"]] = relationship(
        back_populates="form", cascade="all, delete-orphan", init=False
    )
    responses: Mapped[list["FormResponse"]] = relationship(
        back_populates="form", init=False
    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        # init=False,commeted so that it can have custom id
        nullable=False,
        unique=True,
    )

    # DEFAULT arguments for __init__ come after all non-default ones
    # These are columns that have a default, default_factory, or are nullable=True
    description: Mapped[str] = mapped_column(String(100), default="")  # Has a default
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)  # Has a default

    # Timestamps and deletion status are typically managed by the ORM/DB
    # and often set with init=False to exclude them from the constructor.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC), init=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        onupdate=lambda: datetime.now(UTC),  # Use UTC for consistency
        init=False,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None, init=False
    )
