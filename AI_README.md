# AI Course Scheduler - Project Context & Overview

이 문서는 다른 AI 모델이 현재까지 개발된 'AI Course Scheduler (AI 수강 비서)' 웹 프로젝트의 구조와 역할을 쉽게 파악할 수 있도록 작성된 요약 문서입니다.

## 1. 기술 스택 (Tech Stack)
*   **Frontend**: React (Vite 기반), Tailwind CSS, Axios, Lucide-React (아이콘)
*   **Backend**: FastAPI (Python), SQLAlchemy (ORM), SQLite (DB), Pydantic (데이터 검증)
*   **AI Integration**: Gemini API (사용자 의도 파악 및 액션 추출용)

## 2. 프로젝트 디렉토리 구조 (Directory Structure)
```text
dsuWebProject/
├── backend/
│   ├── main.py          # FastAPI 메인 엔트리포인트 (라우팅 및 API 엔드포인트)
│   ├── models.py        # SQLAlchemy 데이터베이스 모델 (Course, CartItem)
│   ├── schemas.py       # Pydantic 데이터 검증 스키마
│   ├── database.py      # SQLite DB 엔진 및 세션 설정
│   ├── dummy_data.py    # 초기 테스트용 더미 데이터 생성 스크립트
│   ├── ai_agent.py      # Gemini API와 통신하여 챗봇 응답 및 액션을 결정하는 로직
│   └── read_excel.py    # 엑셀 파일에서 강의 데이터를 파싱하는 유틸리티
└── frontend/
    ├── package.json     # 프론트엔드 의존성 관리
    ├── tailwind.config.js # Tailwind CSS 설정
    └── src/
        ├── App.jsx      # 메인 컴포넌트 (레이아웃, 탭 네비게이션, 상태 관리)
        ├── main.jsx     # React 앱 진입점
        └── components/
            ├── Chatbot.jsx         # 우측 고정형 AI 채팅 인터페이스
            ├── CourseSearch.jsx    # 강의 검색 및 목록 표시 컴포넌트
            ├── Timetable.jsx       # 장바구니에 담긴 강의들을 보여주는 시간표 컴포넌트
            └── CreditDashboard.jsx # 현재 담은 강의 기반 학점 통계 대시보드
```

## 3. 핵심 기능 (Core Features)

### 3.1. 화면 구성 (Frontend)
*   **좌측 메인 패널**: 탭(`activeTab`)을 통해 세 가지 화면으로 전환됩니다.
    *   `CourseSearch`: 전체 강의 목록을 확인하고 수동으로 장바구니에 담을 수 있습니다.
    *   `Timetable`: 장바구니에 담은 강의 목록을 조회하고 시간표를 확인합니다 (삭제 가능).
    *   `CreditDashboard`: 담은 과목들의 이수구분별 학점 통계를 보여줍니다.
*   **우측 사이드바**: `Chatbot` 컴포넌트가 고정되어 있어 사용자가 언제든지 AI와 대화할 수 있습니다.

### 3.2. AI 챗봇 및 자동화 (Backend & AI)
*   사용자가 채팅으로 자연어 명령을 내립니다 (예: "금요일에 듣기 좋은 3학점짜리 교양 과목 추천해주고 장바구니에 담아줘").
*   `POST /chat` API가 이 메시지를 받아 `ai_agent.py`로 전달합니다. 이때 DB의 강의 정보(`courses_info`)도 함께 컨텍스트로 제공됩니다.
*   AI는 응답 텍스트(`reply`)뿐만 아니라, 특정 행동이 필요한 경우 `action` (예: `"ADD_CART"`)과 `target_course_code`를 JSON 형태로 반환합니다.
*   백엔드(`main.py`)는 `ADD_CART` 액션을 감지하면 DB 조회를 거쳐 자동으로 해당 과목을 장바구니(`CartItem`)에 담고, 그 결과를 챗봇 응답 텍스트에 추가해줍니다.

## 4. 데이터 모델 (Data Models)
*   **Course**: 강의 기본 정보. 필드(`id`, `code`, `title`, `professor`, `credits`, `category`, `tags`, `location`, `schedule`)
*   **CartItem**: 사용자가 담은 장바구니 정보. 필드(`id`, `course_id`, `user_id` - 현재 user_id는 1로 하드코딩됨)

## 5. API 엔드포인트 (Endpoints)
*   `GET /courses`: 전체 강의 목록 조회 (페이징 지원)
*   `POST /chat`: AI 채팅 메시지 전송 및 처리 (자동 장바구니 담기 로직 포함)
*   `GET /cart`: 현재 사용자의 장바구니 아이템 목록 조회
*   `POST /cart`: 수동으로 장바구니에 항목 추가
*   `DELETE /cart/{item_id}`: 장바구니에서 특정 항목 삭제
*   `GET /check_timetable`: (개발 중) 시간표 겹침 등의 상태 확인용 더미 엔드포인트

## 6. 개발 진행 상태 및 참고 사항
*   프론트엔드와 백엔드 간의 기본적인 CRUD 및 AI 연동이 완료된 상태입니다.
*   데이터베이스는 로컬 SQLite (`sql_app.db`)를 사용 중입니다.
*   향후 사용자 인증(로그인), 시간표 UI의 그리드 시각화 고도화, 실제 강의 데이터 연동 등의 추가 개발이 필요할 수 있습니다.
