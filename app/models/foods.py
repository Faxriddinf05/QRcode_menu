from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Food(Base):
    __tablename__ = 'foods'
    id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    name: Mapped[str]
    price: Mapped[int]
    image: Mapped[str]
    is_stock: Mapped[bool] = mapped_column(default=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('category.id'))

    category: Mapped['Category'] = relationship(back_populates='foods')


