import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY is not set.")

def get_chat_response(message: str, courses_info: str) -> dict:
    if not GEMINI_API_KEY:
        # Mock response if no key is set
        return {
            "reply": "API 키가 설정되지 않아 더미 응답을 반환합니다. 장바구니 기능을 테스트하려면 'A과목 담아줘'라고 해보세요.",
            "action": None
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        너는 대학교 수강신청 및 시간표 작성 보조 AI 챗봇이야.
        학생이 묻는 말에 친절하게 답변하고, 다음 강의 정보를 기반으로 추천해줘.
        
        [강의 정보]
        {courses_info}
        
        학생 메시지: {message}
        
        응답은 다음 JSON 형식으로만 반환해:
        {{
            "reply": "학생에게 할 자연스러운 대답",
            "action": "ADD_CART" 또는 "REMOVE_CART" 또는 null,
            "target_course_code": "행동의 대상이 되는 과목 코드(없으면 null)"
        }}
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Simple extraction for demo
        import json
        text = text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return data
    except Exception as e:
        return {"reply": f"AI 처리 중 오류가 발생했습니다: {str(e)}", "action": None}
