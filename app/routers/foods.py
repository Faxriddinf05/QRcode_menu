from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.connection import get_db
from app.models.category import Category
from app.models.foods import Food
from app.schemas.foods import CreateFood


router = APIRouter(tags=['Foods'], prefix='/foods')


# pagination get food
@router.get('/')
def get_food(db = Depends(get_db)):
    return db.execute(select(Food).options(selectinload(Food.category))).scalars().all()


@router.post('/')
def create_food(data: CreateFood, db = Depends(get_db)):
    category = db.execute(select(Category).where(Category.id == data.category_id)).scalars().first()
    if not category:
        return {'message': 'Category not found'}
    else:
        obj = Food(
            name=data.name,
            price=data.price,
            image=data.image,
            category_id=data.category_id
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj