from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product


class Cart(TimestampedBase):
    __tablename__ = "carts"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True
    )

    user: Mapped["User"] = relationship("User", back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(TimestampedBase):
    __tablename__ = "cart_items"

    cart_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("carts.id"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    cart: Mapped["Cart"] = relationship("Cart", back_populates="items")
    product: Mapped["Product"] = relationship("Product")
