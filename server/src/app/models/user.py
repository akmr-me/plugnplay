import uuid as uuid_pkg
from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON

from ..core.db.database import Base


class User(Base):
    __tablename__ = "user"

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

    # username: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(30), default="")

    image_url: Mapped[str] = mapped_column(
        String, default="https://profileimageurl.com"
    )
    # uuid: Mapped[uuid_pkg.UUID] = mapped_column(
    #     default_factory=uuid_pkg.uuid4, primary_key=True, unique=True
    # )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    last_sign_in_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=None
    )
    is_deleted: Mapped[bool] = mapped_column(default=False, index=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)

    tier_id: Mapped[int | None] = mapped_column(
        ForeignKey("tier.id"), index=True, default=None, init=False
    )
