from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.Course).first():
        db.close()
        return

    courses = [
        models.Course(
            code="CS101", title="파이썬 프로그래밍", professor="김파이", credits=3,
            category="전공필수", tags="코딩,기초,파이썬,실습", location="공학관 301호", schedule="월1,수2"
        ),
        models.Course(
            code="CS102", title="자료구조", professor="이자료", credits=3,
            category="전공필수", tags="자료구조,알고리즘,C++", location="공학관 302호", schedule="화3,목4"
        ),
        models.Course(
            code="GE201", title="인간과 심리", professor="박심리", credits=2,
            category="교양", tags="인문/사회,심리학,교양", location="인문관 105호", schedule="금1,금2", is_pn_eligible=1
        ),
        models.Course(
            code="CS301", title="인공지능 개론", professor="최AI", credits=3,
            category="전공선택", tags="AI,머신러닝,파이썬", location="공학관 401호", schedule="월3,수4"
        ),
        models.Course(
            code="GE301", title="실용 영어 회화", professor="John Doe", credits=2,
            category="교양", tags="어학,영어,회화", location="본관 201호", schedule="화1,화2", is_pn_eligible=1
        ),
    ]

    db.add_all(courses)
    db.commit()
    db.close()

if __name__ == "__main__":
    init_db()
    print("Dummy data initialized.")
