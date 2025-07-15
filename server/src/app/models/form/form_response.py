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

from app.core.db.database import Base
from .form import Form


class FormResponse(Base):
    __tablename__ = "form_response"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        init=False,
        nullable=False,
        unique=True,
    )

    form_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("form.id", ondelete="CASCADE"), nullable=False
    )

    # Optional relationship to access the form from a response
    form: Mapped["Form"] = relationship(back_populates="responses", init=False)
    values: Mapped[list["FormResponseValue"]] = relationship(
        back_populates="response", cascade="all, delete-orphan", init=False
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default_factory=lambda: datetime.now(
            UTC
        ),  # ✅ this returns a datetime instance
    )
