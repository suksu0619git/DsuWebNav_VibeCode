import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from database import engine, Base, get_db
import models
import schemas
import dummy_data
from ai_agent import get_chat_response

# Initialize DB
dummy_data.init_db()

app = FastAPI(
    title="AI Course Scheduler API"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use APIRouter to handle the /api prefix on Vercel
router = APIRouter(prefix="/api" if os.environ.get("VERCEL") else "")

@router.get("/courses", response_model=list[schemas.Course])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses

@router.post("/chat", response_model=schemas.ChatResponse)
def chat_with_ai(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    courses_info = "\n".join([f"{c.code}: {c.title} ({c.professor}) - {c.tags}" for c in courses])
    
    # Send to AI Agent
    ai_result = get_chat_response(request.message, courses_info)
    
    # Process actions if any
    reply_message = ai_result.get("reply", "응답을 생성할 수 없습니다.")
    action = ai_result.get("action")
    target_code = ai_result.get("target_course_code")
    
    if action == "ADD_CART" and target_code:
        course = db.query(models.Course).filter(models.Course.code == target_code).first()
        if course:
            existing = db.query(models.CartItem).filter(models.CartItem.course_id == course.id, models.CartItem.user_id == 1).first()
            if not existing:
                cart_item = models.CartItem(course_id=course.id, user_id=1)
                db.add(cart_item)
                db.commit()
                reply_message += f"\n[시스템] {course.title} 과목을 장바구니에 담았습니다."
            else:
                reply_message += f"\n[시스템] {course.title} 과목은 이미 장바구니에 있습니다."
        else:
            reply_message += "\n[시스템] 해당 과목 코드를 찾을 수 없습니다."
            
    return schemas.ChatResponse(reply=reply_message, action_taken=action)

@router.get("/cart", response_model=list[schemas.CartItem])
def get_cart(db: Session = Depends(get_db)):
    # Mock user ID 1
    items = db.query(models.CartItem).filter(models.CartItem.user_id == 1).all()
    return items

@router.post("/cart", response_model=schemas.CartItem)
def add_to_cart(item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    db_item = models.CartItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/cart/{item_id}")
def delete_cart_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.CartItem).filter(models.CartItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Item not found")

@router.get("/check_timetable")
def check_timetable(db: Session = Depends(get_db)):
    # Dummy logic to check locations and timings
    return {"status": "ok", "warnings": []}

app.include_router(router)
