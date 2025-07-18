from datetime import UTC, datetime
import uuid
import uuid_utils
from enum import Enum as PyEnum

from sqlalchemy import (
    String,
    ForeignKey,
    DateTime,
    JSON,
    Enum,
)  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base


class CredentialType(str, PyEnum):
    BEARER = "bearer-token"
    CUSTOM = "custom-token"
    API_KEY = "api-key"
    BASIC = "basic-auth"
    GOOGLE_OAUTH = "google-oauth"


class Credential(Base):
    __tablename__ = "credential"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        init=False,
        nullable=False,
        unique=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # user-defined name
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)

    type: Mapped[CredentialType] = mapped_column(Enum(CredentialType), nullable=False)

    # Optional fields depending on type
    bearer_token: Mapped[str | None] = mapped_column(String, nullable=True)
    custom_token: Mapped[str | None] = mapped_column(String, nullable=True)

    api_key_name: Mapped[str | None] = mapped_column(
        String, nullable=True
    )  # e.g., "x-api-key"
    api_key_value: Mapped[str | None] = mapped_column(String, nullable=True)

    basic_username: Mapped[str | None] = mapped_column(String, nullable=True)
    basic_password: Mapped[str | None] = mapped_column(String, nullable=True)

    # For Google OAuth
    oauth_client_id: Mapped[str | None] = mapped_column(String, nullable=True)
    oauth_client_secret: Mapped[str | None] = mapped_column(String, nullable=True)
    oauth_refresh_token: Mapped[str | None] = mapped_column(String, nullable=True)
    oauth_scopes: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC), init=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        onupdate=lambda: datetime.now(UTC),  # Use UTC for consistency
        init=False,
    )
