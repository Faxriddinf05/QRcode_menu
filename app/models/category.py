from sqlalchemy.orm import Mapped, mapped_column,relationship
from app.db.base import Base
from typing import List
from app.models.foods import Food

class Category(Base):
    __tablename__ = 'category'
    id: Mapped[int]= mapped_column(autoincrement=True, primary_key=True)
    name: Mapped[str]
    description: Mapped[str]

    foods: Mapped[List['Food']] = relationship(back_populates='category')


