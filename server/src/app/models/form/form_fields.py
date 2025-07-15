from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import (
    String,
    ForeignKey,
    DateTime,
    CheckConstraint,
)  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

# from .form import Form

from app.core.db.database import Base


ALLOWED_FIELD_TYPES = ("text", "email", "number", "textarea", "date")


class FormField(Base):
    __tablename__ = "form_field"

    # Columns with init=False are not part of the __init__ signature,
    # so their order relative to other fields doesn't matter for this error.
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        init=False,
        nullable=False,
        unique=True,
    )

    form_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("form.id", ondelete="CASCADE"), index=True, nullable=False
    )  # Assuming user_id is always required and not nullable
    position: Mapped[int] = mapped_column(nullable=False)
    placeholder: Mapped[str] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    # Do init false so that it wont ask form values at start
    form: Mapped["Form"] = relationship(back_populates="fields", init=False)
    response: Mapped[list["FormResponseValue"]] = relationship(
        back_populates="field", cascade="all, delete-orphan", default_factory=list
    )

    # DEFAULT arguments for __init__ come after all non-default ones
    # These are columns that have a default, default_factory, or are nullable=True
    type: Mapped[str] = mapped_column(
        String(100), nullable=False, default="text"
    )  # Has a default
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)  # Has a default
    required: Mapped[bool] = mapped_column(default=False)

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
    position: Mapped[int] = mapped_column(nullable=False)
    placeholder: Mapped[str] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    # Relationship back to Form

    __table_args__ = (
        CheckConstraint(f"type IN {ALLOWED_FIELD_TYPES}", name="check_field_type"),
    )
