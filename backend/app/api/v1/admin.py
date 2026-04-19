from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.v1.dependencies import get_current_admin
from app.models.user import User
from app.models.order import Order
from app.models.product import Product

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Dashboard ─────────────────────────────────────────────────────────────────
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_price)).scalar() or 0

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_revenue": float(total_revenue),
    }


# ── Users ─────────────────────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    skip = (page - 1) * limit
    total = db.query(func.count(User.id)).scalar() or 0
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
    }
