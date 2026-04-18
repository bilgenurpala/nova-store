from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.category import CategoryResponse
from app.schemas.product_image import ProductImageResponse


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    stock: int = 0
    category_id: int

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be empty")
        return v.strip()

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("price must be greater than 0")
        return round(v, 2)

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("stock must be 0 or greater")
        return v


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    stock: int | None = None
    category_id: int | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("name must not be empty")
        return v.strip() if v else v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v <= 0:
            raise ValueError("price must be greater than 0")
        return round(v, 2) if v is not None else v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("stock must be 0 or greater")
        return v


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: Decimal
    stock: int
    category_id: int
    category: CategoryResponse
    images: list[ProductImageResponse] = []
    created_at: datetime
    updated_at: datetime


class ProductsListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    skip: int
    limit: int
