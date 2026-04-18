from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user, get_current_admin
from app.models.user import User
from app.models.cart import Cart
from app.models.product import Product
from app.models.order import Order, OrderItem, Address
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_STATUSES = {"pending", "paid", "shipped", "cancelled"}


def _get_order_or_404(order_id: int, db: Session) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty.",
        )

    total = Decimal("0.00")
    for item in cart.items:
        product = db.get(Product, item.product_id)
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product_id} no longer exists.",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'.",
            )
        total += product.price * item.quantity

    order = Order(user_id=current_user.id, status="pending", total_price=total)
    db.add(order)
    db.flush()

    for item in cart.items:
        product = db.get(Product, item.product_id)
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            quantity=item.quantity,
            unit_price=product.price,
        ))
        product.stock -= item.quantity

    db.add(Address(order_id=order.id, **payload.address.model_dump()))

    for item in list(cart.items):
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Order]:
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    order = _get_order_or_404(order_id, db)
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Order:
    order = _get_order_or_404(order_id, db)
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.get("/admin/all")
def list_all_orders(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total = db.query(Order).count()
    items = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}
