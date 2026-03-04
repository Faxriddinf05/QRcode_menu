from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.connection import get_db
from app.models.category import Category
from app.models.foods import Food
from app.schemas.foods import CreateFood, UpdateFood

router = APIRouter(tags=['Foods'], prefix='/foods')


# pagination get food
@router.get('/')
def get_food(db = Depends(get_db)):
    food = db.execute(select(Food).options(selectinload(Food.category))).scalars().all()
    if not food:
        raise HTTPException(400, "There is not any food !")
    return food

@router.post('/')
def create_food(data: CreateFood, db = Depends(get_db)):
    category = db.get(Category, data.category_id)
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


@router.put('{food_id}')
def update_food(food_id: int, data: UpdateFood, db = Depends(get_db)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(404, "Food not found")
    food.name = data.name
    food.price = data.price
    food.image = data.image
    food.category_id = data.category_id
    db.commit()
    db.refresh(food)
    return food


@router.delete('/{food_id}')
def delete_food(food_id: int, db = Depends(get_db)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(404, "Food not found")
    db.delete(food)
    db.commit()
    return {'msg': 'Removed'}