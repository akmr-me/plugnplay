from datetime import UTC, datetime
import uuid
import uuid_utils

from sqlalchemy import (
    Text,
    ForeignKey,
    DateTime,
    CheckConstraint,
)  # Import func for onupdate
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..form.form_response import FormResponse
from ..form.form_fields import FormField
from app.core.db.database import Base


class FormResponseValue(Base):
    __tablename__ = "form_response_value"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default_factory=uuid_utils.uuid7,
        init=False,
        nullable=False,
        unique=True,
    )
    response_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("form_response.id", ondelete="CASCADE"), nullable=False
    )

    field_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("form_field.id", ondelete="CASCADE"), nullable=False
    )

    value: Mapped[str] = mapped_column(Text, nullable=True)

    # Optional relationships (for easier joins)
    response: Mapped["FormResponse"] = relationship(back_populates="values", init=False)
    field: Mapped["FormField"] = relationship(back_populates="response", init=False)
