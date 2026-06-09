import os
import re
import json
from dotenv import load_dotenv

load_dotenv(override=True)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is not set. Rule-based fallback will be used.")


# ────────────────────────────────────────────────────────────────
# 규칙 기반 폴백 (Gemini API 없이도 핵심 기능 동작)
# ────────────────────────────────────────────────────────────────
def _rule_based_response(message: str, courses_info: str) -> dict:
    """
    Gemini API를 사용할 수 없을 때 패턴 매칭으로 핵심 기능을 처리합니다.
    """
    msg = message.split('||')[0].strip()  # studentId 제거
    msg_lower = msg.lower()

    # 1. 시간표 자동 생성 요청 감지
    build_keywords = ["시간표 짜", "시간표 만들", "자동 시간표", "시간표 추천",
                      "금공강", "금요일 공강", "18학점", "학점 채워", "최대 학점",
                      "주 4일", "주4일", "공강 시간표"]
    if any(kw in msg for kw in build_keywords):
        friday_free = any(kw in msg for kw in ["금공강", "금요일 공강", "금요일", "주 4일", "주4일"])
        no_morning  = any(kw in msg for kw in ["아침", "1교시", "오전 일찍", "조조"])
        lunch_free  = any(kw in msg for kw in ["점심", "12시", "13시"])
        # 학점 파싱 (예: "18학점", "15학점")
        credit_match = re.search(r'(\d+)\s*학점', msg)
        min_credits  = int(credit_match.group(1)) if credit_match else 12
        min_credits  = max(6, min(min_credits, 18))

        conds = []
        if friday_free: conds.append("금공강")
        if no_morning:  conds.append("아침수업 제외")
        if lunch_free:  conds.append("점심 보장")
        cond_str = " + ".join(conds) if conds else "학점 최적화"

        return {
            "reply": f"네! {cond_str} 조건으로 {min_credits}학점 이상 시간표를 자동으로 구성해 드릴게요. 잠시만 기다려 주세요!",
            "action": "BUILD_TIMETABLE",
            "target_course_code": None,
            "constraints": {
                "fridayFree": friday_free,
                "noMorning":  no_morning,
                "lunchFree":  lunch_free,
                "minCredits": min_credits,
            }
        }

    # 2. 장바구니 담기 요청 감지 (과목 코드 추출)
    add_keywords = ["담아줘", "담아 줘", "장바구니", "추가해줘", "넣어줘", "담아줄래", "추가해 줘"]
    if any(kw in msg for kw in add_keywords):
        # 과목 코드 형태: 대문자+숫자 (예: CS101, GEN202)
        code_match = re.search(r'\b([A-Za-z]{2,6}\d{3,4})\b', msg)
        if code_match:
            code = code_match.group(1).upper()
            return {
                "reply": f"{code} 과목을 장바구니에 담아드리겠습니다!",
                "action": "ADD_CART",
                "target_course_code": code,
                "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
            }
        else:
            # 코드가 없으면 과목명에서 코드 찾기
            # courses_info에서 키워드 매칭
            for line in courses_info.splitlines():
                parts = line.split(':')
                if len(parts) >= 2:
                    code = parts[0].strip()
                    rest = parts[1]
                    # 과목명이 메시지에 포함되면 담기
                    title_match = rest.split('(')[0].strip() if '(' in rest else rest.strip()
                    if title_match and title_match in msg:
                        return {
                            "reply": f"'{title_match}' 과목({code})을 장바구니에 담아드리겠습니다!",
                            "action": "ADD_CART",
                            "target_course_code": code,
                            "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
                        }
            return {
                "reply": "담을 과목 코드(예: CS101)나 과목명을 함께 알려주시면 바로 장바구니에 담아드릴게요!",
                "action": None,
                "target_course_code": None,
                "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
            }

    # 3. 추천 요청 감지
    rec_keywords = ["추천", "어떤 거", "뭐 들어야", "뭐 들을까", "골라줘"]
    if any(kw in msg for kw in rec_keywords):
        # 교양/전공 구분
        if any(kw in msg for kw in ["교양", "일반", "선택"]):
            cat_filter = "교양"
        elif any(kw in msg for kw in ["전공", "컴퓨터", "소프트웨어", "공학"]):
            cat_filter = "전공"
        else:
            cat_filter = None

        # courses_info에서 최대 5개 샘플 추출
        lines = [l for l in courses_info.splitlines() if l.strip()]
        if cat_filter:
            lines = [l for l in lines if cat_filter in l]
        sample = lines[:5]
        sample_text = "\n".join(f"• {l}" for l in sample) if sample else "현재 조회 가능한 과목이 없습니다."

        return {
            "reply": f"추천 과목 목록입니다:\n{sample_text}\n\n과목 코드를 알려주시면 바로 장바구니에 담아드릴게요!",
            "action": None,
            "target_course_code": None,
            "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
        }

    # 4. 기본 응답
    return {
        "reply": (
            "안녕하세요! 수강신청 AI 비서입니다. 다음과 같이 말씀해보세요:\n"
            "• \"금공강 18학점 시간표 짜줘\"\n"
            "• \"CS101 장바구니에 담아줘\"\n"
            "• \"교양 과목 추천해줘\"\n\n"
            "※ 현재 AI 서버 부하로 규칙 기반 모드로 동작 중입니다."
        ),
        "action": None,
        "target_course_code": None,
        "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
    }


# ────────────────────────────────────────────────────────────────
# 메인 함수: Gemini 시도 → 실패 시 규칙 기반 폴백
# ────────────────────────────────────────────────────────────────
def get_chat_response(message: str, courses_info: str) -> dict:
    if not GEMINI_API_KEY:
        return _rule_based_response(message, courses_info)

    try:
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""
너는 대학교 수강신청 및 시간표 작성 보조 AI 챗봇이야.
학생이 묻는 말에 친절하게 답변하고, 다음 강의 정보를 기반으로 추천해줘.

[강의 정보]
{courses_info}

학생 메시지: {message}

학생이 "금공강", "금요일 공강", "시간표 짜줘", "자동 시간표", "18학점", "최대 학점" 등의 표현을 사용하면:
- action을 "BUILD_TIMETABLE"로 설정하고
- constraints 필드에 아래 조건들을 분석해서 포함해줘:
  - fridayFree: 금요일 공강 원하면 true
  - noMorning: 아침수업 제외 원하면 true  
  - lunchFree: 점심 보장 원하면 true
  - minCredits: 원하는 최소 학점 (기본 12, 최대 18)

학생이 특정 과목을 장바구니에 담아달라고 하면:
- action을 "ADD_CART"로 설정하고
- target_course_code에 해당 과목 코드를 설정해줘

응답은 반드시 아래 JSON 형식으로만 반환해. 다른 텍스트는 절대 포함하지 마:
{{
    "reply": "학생에게 할 자연스러운 대답",
    "action": "ADD_CART" 또는 "REMOVE_CART" 또는 "BUILD_TIMETABLE" 또는 null,
    "target_course_code": "행동의 대상이 되는 과목 코드 (없으면 null)",
    "constraints": {{
        "fridayFree": false,
        "noMorning": false,
        "lunchFree": false,
        "minCredits": 12
    }}
}}
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )

        text = response.text.strip()
        # 마크다운 코드블록 제거
        text = text.replace("```json", "").replace("```", "").strip()

        data = json.loads(text)
        return data

    except json.JSONDecodeError as e:
        return {"reply": f"응답 파싱 오류: {str(e)}", "action": None, "target_course_code": None,
                "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}}

    except Exception as e:
        err_str = str(e)
        # 429 할당량 초과 또는 기타 API 오류 → 규칙 기반 폴백으로 자동 전환
        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
            print(f"[WARNING] Gemini API quota exceeded, switching to rule-based fallback. ({err_str[:80]})")
            result = _rule_based_response(message, courses_info)
            result["reply"] = "⚠️ AI 서버 요청 한도를 초과했습니다. 규칙 기반 모드로 전환합니다.\n\n" + result["reply"]
            return result
        # 그 외 오류는 메시지 출력
        return {
            "reply": f"AI 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n(오류: {err_str[:120]})",
            "action": None,
            "target_course_code": None,
            "constraints": {"fridayFree": False, "noMorning": False, "lunchFree": False, "minCredits": 12}
        }
