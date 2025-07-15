from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.core.db.database import Base


class Workflow(Base):
    __tablename__ = "workflow"

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
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project.id"), index=True, nullable=False
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
    edges: Mapped[list] = mapped_column(JSON, default_factory=list, nullable=False)
    nodes: Mapped[list] = mapped_column(JSON, default_factory=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        onupdate=lambda: datetime.now(timezone.utc),  # Update on record modification
    )
