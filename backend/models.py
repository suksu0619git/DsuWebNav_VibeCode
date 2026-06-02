from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    title = Column(String, index=True)
    professor = Column(String)
    credits = Column(Integer)
    category = Column(String)
    tags = Column(String)
    location = Column(String)
    schedule = Column(String)
    is_pn_eligible = Column(Integer, default=0) # Boolean (0 or 1) for SQLite

class CartItem(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    user_id = Column(Integer) # Mock user ID

    course = relationship("Course")
