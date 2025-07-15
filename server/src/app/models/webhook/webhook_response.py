from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import String, ForeignKey, DateTime, func  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID


from app.core.db.database import Base


class WebhookResponse(Base):
    __tablename__ = "webhook_response"

    webhook: Mapped["Webhook"] = relationship(
        "Webhook", back_populates="responses", init=False
    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        init=False,
        nullable=False,
        unique=True,
    )
    webhook_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("webhook.id", ondelete="CASCADE"), nullable=False
    )

    status_code: Mapped[int] = mapped_column()
    response_body: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC), init=False
    )
