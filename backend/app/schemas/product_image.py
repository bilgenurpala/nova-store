from pydantic import BaseModel, ConfigDict


class ProductImageCreate(BaseModel):
    url: str
    alt_text: str = ""
    is_primary: bool = False


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    alt_text: str
    is_primary: bool
