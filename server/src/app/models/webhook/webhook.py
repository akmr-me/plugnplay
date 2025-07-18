from sqlalchemy import String, Enum, ForeignKey, TEXT, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.credential import Credential
from app.models.webhook.webhook_response import WebhookResponse

import uuid_utils
from datetime import datetime, UTC
from enum import Enum as PyEnum
import uuid

from app.core.db.database import Base


class AuthType(str, PyEnum):
    NONE = "none"
    BEARER = "bearer-token"
    CUSTOM = "custom-token"
    API_KEY = "api-key"
    BASIC = "basic-auth"


class HTTPMethod(str, PyEnum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"


class Webhook(Base):
    __tablename__ = "webhook"

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workflow.id", ondelete="CASCADE"), nullable=False
    )
    credentials: Mapped["Credential"] = relationship(
        "Credential", lazy="joined", init=False
    )
    path: Mapped[str] = mapped_column(TEXT, nullable=False)
    credential_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("credential.id"), nullable=True
    )
    responses: Mapped[list["WebhookResponse"]] = relationship(
        "WebhookResponse",
        back_populates="webhook",
        cascade="all, delete-orphan",
        default_factory=list,
        passive_deletes=True,
    )
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        # init=False,commeted so that it can have custom id
        nullable=False,
        unique=True,
    )

    method: Mapped[HTTPMethod] = mapped_column(
        Enum(HTTPMethod), default=HTTPMethod.POST
    )
    auth_type: Mapped[AuthType] = mapped_column(Enum(AuthType), default=AuthType.NONE)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default_factory=lambda: datetime.now(UTC), init=False
    )
    is_deleted: Mapped[bool] = mapped_column(default=False)
