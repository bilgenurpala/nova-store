from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user
from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


def _get_or_404(category_id: int, db: Session) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if db.query(Category).filter(Category.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Name already exists")

    category = Category(name=payload.name, slug=payload.slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return _get_or_404(category_id, db)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    category = _get_or_404(category_id, db)

    if payload.slug and payload.slug != category.slug:
        if db.query(Category).filter(Category.slug == payload.slug).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    if payload.name and payload.name != category.name:
        if db.query(Category).filter(Category.name == payload.name).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Name already exists")

    if payload.name is not None:
        category.name = payload.name
    if payload.slug is not None:
        category.slug = payload.slug

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    category = _get_or_404(category_id, db)
    db.delete(category)
    db.commit()
