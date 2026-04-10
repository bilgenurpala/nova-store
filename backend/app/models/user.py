from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.cart import Cart


class User(TimestampedBase):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cart: Mapped["Cart | None"] = relationship("Cart", back_populates="user", uselist=False)
