from fastapi import FastAPI
from app.routers.category import router as category_router
from app.routers.foods import router as food_router

app = FastAPI(title='QR code menu', docs_url='/')

app.include_router(category_router)
app.include_router(food_router)
