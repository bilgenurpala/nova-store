from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import (
    AddToCartRequest,
    CartResponse,
    RemoveCartItemRequest,
    UpdateCartItemRequest,
)

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_or_create_cart(user: User, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _get_product_or_404(product_id: int, db: Session) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id={product_id} not found",
        )
    return product


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_create_cart(current_user, db)


@router.post("/add", response_model=CartResponse)
def add_to_cart(
    payload: AddToCartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_product_or_404(payload.product_id, db)
    cart = _get_or_create_cart(current_user, db)

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )

    if existing_item:
        existing_item.quantity += payload.quantity
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=payload.product_id,
            quantity=payload.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(cart)
    return cart


@router.put("/update", response_model=CartResponse)
def update_cart_item(
    payload: UpdateCartItemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = _get_or_create_cart(current_user, db)

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart",
        )

    if payload.quantity == 0:
        db.delete(item)
    else:
        item.quantity = payload.quantity

    db.commit()
    db.refresh(cart)
    return cart


@router.delete("/remove", response_model=CartResponse)
def remove_from_cart(
    payload: RemoveCartItemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = _get_or_create_cart(current_user, db)

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart",
        )

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return cart
