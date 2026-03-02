from pydantic import BaseModel


class CreateCategory(BaseModel):
    name: str
    description: str


class UpdateCategory(CreateCategory):
    pass