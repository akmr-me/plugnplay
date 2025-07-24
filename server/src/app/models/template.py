from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.core.db.database import Base


class Template(Base):
    __tablename__ = "template"

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflow.id", ondelete="SET NULL"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    edges: Mapped[list] = mapped_column(JSON, nullable=False)
    nodes: Mapped[list] = mapped_column(JSON, nullable=False)
    created_by: Mapped[str] = mapped_column(
        ForeignKey("user.user_id"), index=True, nullable=False
    )

    description: Mapped[str] = mapped_column(String(500), default="")
    viewport: Mapped[dict] = mapped_column(
        JSON,
        default_factory=lambda: {
            "x": 0,
            "y": 0,
            "zoom": 1,
        },  # Changed zoom default to 1 as 0 zoom is unusual
        nullable=False,
    )
    fork_count: Mapped[int] = mapped_column(default=0, nullable=False)
    is_activated: Mapped[bool] = mapped_column(default=False, index=True)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(
            as_uuid=True
        ),  # Use SQLAlchemy's PostgreSQL UUID type, map to Python uuid.UUID object
        primary_key=True,
        default_factory=uuid_utils.uuid7,  # Automatically generate UUIDv7
        init=False,  # Don't include 'id' in the __init__ method for new instances
        nullable=False,
        unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        onupdate=lambda: datetime.now(timezone.utc),  # Update on record modification
    )
