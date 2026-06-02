from pydantic import BaseModel
from typing import Optional, List

class CourseBase(BaseModel):
    code: str
    title: str
    professor: str
    credits: int
    category: str
    tags: str
    location: str
    schedule: str
    is_pn_eligible: bool = False

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        orm_mode = True

class CartItemBase(BaseModel):
    course_id: int
    user_id: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    course: Course

    class Config:
        orm_mode = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    action_taken: Optional[str] = None
