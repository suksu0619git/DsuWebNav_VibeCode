import sys
import os
# Force Python to find sibling modules (database.py, models.py etc.) regardless of working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
import dummy_data
from ai_agent import get_chat_response

# Initialize DB (creates tables + seeds dummy data)
dummy_data.init_db()

app = FastAPI(title="AI Course Scheduler API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# Register route handlers as plain functions first,
# then attach them to BOTH routers:
#   • root_router  → /courses, /cart ...  (local uvicorn dev)
#   • api_router   → /api/courses, ...    (Vercel production)
# This eliminates any dependency on the VERCEL env variable.
# ─────────────────────────────────────────────────────────────
root_router = APIRouter()
api_router  = APIRouter(prefix="/api")

def _read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Course).offset(skip).limit(limit).all()

def _chat_with_ai(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    courses_info = "\n".join([
        f"{c.code}: {c.title} ({c.professor}) - {c.tags}" for c in courses
    ])
    ai_result = get_chat_response(request.message, courses_info)

    reply_message = ai_result.get("reply", "응답을 생성할 수 없습니다.")
    action = ai_result.get("action")
    target_code = ai_result.get("target_course_code")

    if action == "ADD_CART" and target_code:
        course = db.query(models.Course).filter(models.Course.code == target_code).first()
        if course:
            existing = db.query(models.CartItem).filter(
                models.CartItem.course_id == course.id,
                models.CartItem.user_id == 1
            ).first()
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

def _get_cart(db: Session = Depends(get_db)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == 1).all()

def _add_to_cart(item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    db_item = models.CartItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def _delete_cart_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.CartItem).filter(models.CartItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Item not found")

def _check_timetable(db: Session = Depends(get_db)):
    return {"status": "ok", "warnings": []}

# Attach to root router (local dev)
root_router.add_api_route("/courses",          _read_courses,     methods=["GET"],    response_model=list[schemas.Course])
root_router.add_api_route("/chat",             _chat_with_ai,     methods=["POST"],   response_model=schemas.ChatResponse)
root_router.add_api_route("/cart",             _get_cart,         methods=["GET"],    response_model=list[schemas.CartItem])
root_router.add_api_route("/cart",             _add_to_cart,      methods=["POST"],   response_model=schemas.CartItem)
root_router.add_api_route("/cart/{item_id}",   _delete_cart_item, methods=["DELETE"])
root_router.add_api_route("/check_timetable",  _check_timetable,  methods=["GET"])

# Attach to /api router (Vercel production)
api_router.add_api_route("/courses",          _read_courses,     methods=["GET"],    response_model=list[schemas.Course])
api_router.add_api_route("/chat",             _chat_with_ai,     methods=["POST"],   response_model=schemas.ChatResponse)
api_router.add_api_route("/cart",             _get_cart,         methods=["GET"],    response_model=list[schemas.CartItem])
api_router.add_api_route("/cart",             _add_to_cart,      methods=["POST"],   response_model=schemas.CartItem)
api_router.add_api_route("/cart/{item_id}",   _delete_cart_item, methods=["DELETE"])
api_router.add_api_route("/check_timetable",  _check_timetable,  methods=["GET"])

app.include_router(root_router)
app.include_router(api_router)
