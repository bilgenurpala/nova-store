from __future__ import annotations
from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AddressCreate(BaseModel):
    full_name: str
    line1: str
    line2: str | None = None
    city: str
    country: str
    postal_code: str


class AddressResponse(AddressCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    address: AddressCreate


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|paid|shipped|cancelled)$")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    status: str
    total_price: Decimal
    items: list[OrderItemResponse]
    address: AddressResponse | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
