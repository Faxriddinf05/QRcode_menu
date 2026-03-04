from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.connection import get_db
from app.models.category import Category
from app.schemas.category import CreateCategory, UpdateCategory

router = APIRouter(tags=['Category'], prefix='/category')


@router.get('/')
def get_category(db = Depends(get_db)):
    category = db.execute(select(Category).options(selectinload(Category.foods))).scalars().all()
    if not category:
        raise HTTPException(400, "There is not any category !")
    return category

@router.post('/')
def create_category(data: CreateCategory, db = Depends(get_db)):
    category = db.execute(select(Category).options(selectinload(Category.foods))).scalars().all()
    if not category:
        raise HTTPException(400, "There is not any category !")
    obj = Category(
        name = data.name,
        description = data.description
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put('/{category_id}')
def update_category(category_id:int, data: UpdateCategory, db = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "Category not found")

    category.name = data.name
    category.description = data.description
    db.commit()
    return "Changed"

@router.delete('/{category_id}')
def delete_category(category_id:int, db = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "Category not found")
    db.delete(category)
    db.commit()
    return {'msg' : 'Removed'}