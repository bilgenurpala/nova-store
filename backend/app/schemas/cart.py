from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.product import ProductResponse


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("quantity must be at least 1")
        return v


class UpdateCartItemRequest(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("quantity must be 0 or greater")
        return v


class RemoveCartItemRequest(BaseModel):
    product_id: int


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: ProductResponse


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    items: list[CartItemResponse]
    created_at: datetime
    updated_at: datetime
