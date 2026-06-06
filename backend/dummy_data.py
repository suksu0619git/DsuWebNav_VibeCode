from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear old data to refresh dummy database with new enhanced courses
    try:
        db.query(models.CartItem).delete()
        db.query(models.Course).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error clearing DB: {e}")

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
            code="CS201", title="웹 프로그래밍", professor="박웹", credits=3,
            category="전공필수", tags="웹,HTML,CSS,Javascript", location="공학관 301호", schedule="월2,수3"
        ),
        models.Course(
            code="CS202", title="데이터베이스 시스템", professor="정디비", credits=3,
            category="전공필수", tags="SQL,DB,데이터,설계", location="정보관 202호", schedule="월3,수4"
        ),
        models.Course(
            code="CS301", title="인공지능 개론", professor="최AI", credits=3,
            category="전공선택", tags="AI,머신러닝,파이썬,딥러닝", location="공학관 401호", schedule="월4,수5"
        ),
        models.Course(
            code="CS401", title="컴퓨터 네트워크", professor="한네트", credits=3,
            category="전공선택", tags="네트워크,IP,TCP,인터넷", location="정보관 501호", schedule="화4,목5"
        ),
        models.Course(
            code="GE201", title="인간과 심리", professor="박심리", credits=2,
            category="교양", tags="인문,심리학,마음,교양", location="인문관 105호", schedule="금1,금2", is_pn_eligible=1
        ),
        models.Course(
            code="GE202", title="한국사의 재조명", professor="이역사", credits=2,
            category="교양", tags="인문,역사,한국사,교양", location="인문관 102호", schedule="금3,금4", is_pn_eligible=1
        ),
        models.Course(
            code="GE203", title="글쓰기와 토론", professor="김글", credits=2,
            category="교양", tags="인문,글쓰기,토론,교양", location="본관 103호", schedule="금5,금6", is_pn_eligible=1
        ),
        models.Course(
            code="GE301", title="실용 영어 회화", professor="John Doe", credits=2,
            category="교양", tags="어학,영어,회화,글로벌", location="본관 201호", schedule="화1,화2", is_pn_eligible=1
        ),
        models.Course(
            code="GE302", title="글로벌 비즈니스 매너", professor="정경영", credits=2,
            category="교양", tags="경영,비즈니스,글로벌,교양", location="본관 304호", schedule="목1,목2", is_pn_eligible=1
        ),
        models.Course(
            code="GE101", title="철학의 탐구", professor="한철학", credits=2,
            category="교양", tags="철학,생각,인문,교양", location="인문관 201호", schedule="화2,화3", is_pn_eligible=1
        ),
    ]

    db.add_all(courses)
    db.commit()
    db.close()

if __name__ == "__main__":
    init_db()
    print("Enhanced dummy data initialized.")

