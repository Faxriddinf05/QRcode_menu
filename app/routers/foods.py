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
def get_food(category_id: int = None, db = Depends(get_db)):
    if category_id is not None:
        category_exist = db.execute(select(Category).where(Category.id == category_id)).scalar()
        if not category_exist:
            raise HTTPException(404, 'Category not found!')

        query = select(Food).options(selectinload(Food.category)).where(Food.category_id == category_id)
        result = db.execute(query).scalars().all()
        return result

    food = db.execute(select(Food).options(selectinload(Food.category))).scalars().all()

    if not food:
        raise HTTPException(404, "There is no food at all!")

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

@router.put('/status/{food_id}')
def status_update(food_id: int, db = Depends(get_db)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(404, "Food not found")
    food.is_stock = False
    db.commit()
    return "Food's stock updated"


@router.delete('/{food_id}')
def delete_food(food_id: int, db = Depends(get_db)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(404, "Food not found")
    db.delete(food)
    db.commit()
    return {'msg': 'Removed'}