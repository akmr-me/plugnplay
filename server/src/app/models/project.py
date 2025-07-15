from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime, func  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.core.db.database import Base


class Project(Base):
    __tablename__ = "project"

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

    # NON-DEFAULT arguments for __init__ must come first
    # These are columns that are nullable=False and have no default/default_factory
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("user.user_id"), index=True, nullable=False
    )  # Assuming user_id is always required and not nullable

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

    # Optional: Add relationship if you have a User model
    # from sqlalchemy.orm import relationship
    # user: Mapped["User"] = relationship("User", back_populates="projects") # Assuming "User" model exists and has a "projects" back_populates
