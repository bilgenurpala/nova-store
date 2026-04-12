from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.product import Product


class ProductImage(TimestampedBase):
    __tablename__ = "product_images"

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    alt_text: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="0")

    product: Mapped["Product"] = relationship("Product", back_populates="images")
