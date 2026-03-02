from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.connection import get_db
from app.models.category import Category
from app.schemas.category import CreateCategory


router = APIRouter(tags=['Category'], prefix='/category')


@router.get('/')
def get_category(db = Depends(get_db)):
    return db.execute(select(Category).options(selectinload(Category.foods))).scalars().all()


@router.post('/')
def create_category(data: CreateCategory, db = Depends(get_db)):
    obj = Category(
        name = data.name,
        description = data.description
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj