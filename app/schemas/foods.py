from pydantic import BaseModel, Field


class CreateFood(BaseModel):
    name: str
    price: int = Field(gt=0)
    image: str
    category_id: int = Field(gt=0)


class UpdateFood(CreateFood):
    pass