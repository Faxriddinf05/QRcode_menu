from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.category import router as category_router
from app.routers.foods import router as food_router


app = FastAPI(title='QR code menu', docs_url='/')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(category_router)
app.include_router(food_router)
