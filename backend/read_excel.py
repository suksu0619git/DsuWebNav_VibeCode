import pandas as pd
import json
import sys
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import math

# Ensure stdout uses utf-8
sys.stdout.reconfigure(encoding='utf-8')

def process_major_courses(file_path, db, seen_codes):
    print(f"\n--- Processing Major Courses: {file_path} ---")
    try:
        df = pd.read_excel(file_path)
        courses = []
        for index, row in df.iterrows():
            code = f"{row.get('교과목번호', '')}-{row.get('분반', '')}"
            if code in seen_codes:
                continue
            seen_codes.add(code)
            
            title = str(row.get('교과목명', ''))
            professor = str(row.get('담당교수', '미정'))
            credits = int(row.get('학점', 0)) if pd.notna(row.get('학점')) else 0
            category = str(row.get('이수구분', ''))
            
            # tags formatting
            tags_list = []
            if pd.notna(row.get('전공')): tags_list.append(str(row.get('전공')))
            if pd.notna(row.get('주간/야간')): tags_list.append(str(row.get('주간/야간')))
            if pd.notna(row.get('수강학년')): tags_list.append(f"{int(row.get('수강학년'))}학년" if type(row.get('수강학년')) in [float, int] and not math.isnan(row.get('수강학년')) else str(row.get('수강학년')))
            tags = ",".join(tags_list)

            location = str(row.get('건물 강의실', '미정')) if pd.notna(row.get('건물 강의실')) else "미정"
            
            day = str(row.get('요일', '')) if pd.notna(row.get('요일')) else ""
            period = str(row.get('교시', '')) if pd.notna(row.get('교시')) else ""
            schedule = f"{day} {period}".strip()
            if not schedule:
                schedule = "미정"

            course = models.Course(
                code=code, title=title, professor=professor, credits=credits,
                category=category, tags=tags, location=location, schedule=schedule
            )
            courses.append(course)
        
        db.add_all(courses)
        print(f"Added {len(courses)} major courses.")
    except Exception as e:
        print("Error processing major courses:", e)

def process_general_courses(file_path, db, seen_codes):
    print(f"\n--- Processing General Courses: {file_path} ---")
    try:
        df = pd.read_excel(file_path)
        courses = []
        for index, row in df.iterrows():
            code = f"{row.get('과목번호', '')}-{row.get('분반', '')}"
            if code in seen_codes:
                continue
            seen_codes.add(code)
            
            title = str(row.get('과목명', ''))
            professor = str(row.get('교수명', '미정')) if pd.notna(row.get('교수명')) else "미정"
            credits = int(row.get('학점', 0)) if pd.notna(row.get('학점')) else 0
            category = str(row.get('이수구분', ''))
            
            # tags formatting
            tags_list = []
            if pd.notna(row.get('개설학부/전공')): tags_list.append(str(row.get('개설학부/전공')))
            if pd.notna(row.get('주간/야간')): tags_list.append(str(row.get('주간/야간')))
            tags = ",".join(tags_list)

            location = "미정" # No location column in this excel
            
            day = str(row.get('요일', '')) if pd.notna(row.get('요일')) else ""
            period = str(row.get('교시', '')) if pd.notna(row.get('교시')) else ""
            schedule = f"{day} {period}".strip()
            if not schedule or schedule == "-":
                schedule = "미정"

            course = models.Course(
                code=code, title=title, professor=professor, credits=credits,
                category=category, tags=tags, location=location, schedule=schedule
            )
            courses.append(course)
        
        db.add_all(courses)
        print(f"Added {len(courses)} general courses.")
    except Exception as e:
        print("Error processing general courses:", e)

def import_all_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clear existing courses
    db.query(models.Course).delete()
    db.commit()
    print("Cleared existing courses from database.")

    seen_codes = set()
    process_major_courses("../data/2026-1 컴퓨터계열 강좌개설.xlsx", db, seen_codes)
    process_general_courses("../data/2026학년도 1학기 개설과목 및 시간표(교양).xlsx", db, seen_codes)
    
    db.commit()
    print("All courses committed to database.")
    db.close()

if __name__ == "__main__":
    import_all_data()
