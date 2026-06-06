import React from 'react';
import { X, Book, User, Mail, Phone, Info, LayoutList, Award, CalendarDays } from 'lucide-react';

export default function CourseSyllabusModal({ course, onClose }) {
  if (!course) return null;

  // Mock Data for syllabus, based on the provided example.
  // In a real app, this would be fetched from the backend using the course.id
  const syllabusData = {
    yearTerm: "2026 1학기",
    type: course.category || "전공선택",
    creditInfo: `이론: ${course.credits || 3} 실습: 0`,
    email: "bluesky8008@g.dongseo.ac.kr",
    lab: "미정",
    tel: "-",
    counseling: "-",
    foreignLang: "미실시",
    evalMethod: "상대평가",
    evalElements: "중간고사: 30 / 기말고사: 30 / 주차학습: 10 / 과제: 20 / 발표: 10",
    textbook: "분류: -, 저서명: -, 저자: -, 출판사: -, 발행년: -",
    goals: [
      "AI 기반 개발 패러다임 습득: AI 시대에 변화된 소프트웨어 개발 방식을 이해하고 마인드셋을 정립한다.",
      "프롬프트 및 IDE 도구 마스터: 효율적인 프롬프트 작성법과 AI 전용 IDE(Cursor 등) 활용 능력을 갖춘다.",
      "전주기적 서비스 개발 경험: 기획부터 개발, 디자인, 배포에 이르는 서비스 개발의 전체 과정을 직접 수행한다.",
      "포트폴리오 구축: GitHub 저장소와 배포된 URL을 통해 실무적인 역량을 증명할 수 있는 포트폴리오를 완성한다."
    ],
    overview: "본 강좌는 2학년 1학기 학생 대상으로 하며, 복잡한 문법 공부 이전에 AI 도구를 활용해 '내가 쓸 도구'를 직접 만들어보는 경험을 제공합니다.\n전반부에는 프롬프트 엔지니어링과 AI IDE를 활용한 기초 개발 역량을 기르고, 후반부에는 본인의 아이디어를 실제 웹 서비스로 구현하여 전 세계에 공개(배포)하는 실습 위주의 수업으로 진행됩니다.",
    advice: "-",
    exams: "1. 중간고사: 문서 산출물 평가\n- 컨텍스트 엔지니어링 문서 (프로젝트 설명 문서)\n- 개인 서비스 아이디어 기획서\n\n2. 기말고사: 최종 프로젝트 산출물 평가\n- 랜딩페이지 or README\n- Github 포트폴리오",
    assignments: "주차별 실습 과제",
    weeklyPlan: [
      { week: 1, range: "강의소개: 교수소개, 강의소개 등 / AI시대의 소프트웨어 - AI기초, 개발 패러다임 변화", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 2, range: "AI와 대화하는 법 - 프롬프트 엔지니어링", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 3, range: "AI IDE 완전 정복 (Antigravity/Cursor)", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 4, range: "내가 쓸 도구 만들기 ① - 단위 변환기", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 5, range: "내가 쓸 도구 만들기 ② - 디데이 카운터", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 6, range: "컨텍스트 엔지니어링 - AI에게 내 프로젝트 설명하기", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 7, range: "내 코드 저장소 만들기 - GitHub 기초", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 8, range: "중간고사", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 9, range: "개인 서비스 기획 - 어떤 문제를 해결할까?", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 10, range: "개인 서비스 개발 ① - 핵심 기능 만들기", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 11, range: "개인 서비스 개발 ② - 디자인 다듬기", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 12, range: "세상에 공개하기 - Vercel 배포", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 13, range: "내 서비스 소개 페이지 만들기", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 14, range: "데모데이 - 내 서비스 발표", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 15, range: "보강수업", method: "대면(교실)수업", tools: "-", assign: "-" },
      { week: 16, range: "기말고사", method: "대면(교실)수업", tools: "-", assign: "-" }
    ]
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-md">{syllabusData.yearTerm}</span>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">{course.code}</span>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">{syllabusData.type}</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Book className="text-accent" /> {course.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-200 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Basic Info Grid */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Info size={18} className="text-primary" /> 기본 정보
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><User size={12}/> 담당교수</div>
                <div className="font-semibold text-slate-700">{course.professor}</div>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Mail size={12}/> 이메일</div>
                <div className="font-semibold text-slate-700 text-sm truncate">{syllabusData.email}</div>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs mb-1">학점 (이론/실습)</div>
                <div className="font-semibold text-slate-700">{course.credits}학점 ({syllabusData.creditInfo})</div>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Phone size={12}/> 연구실 / 연락처</div>
                <div className="font-semibold text-slate-700 text-sm">{syllabusData.lab} / {syllabusData.tel}</div>
              </div>
            </div>
          </section>

          {/* Evaluation & Materials */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Award size={18} className="text-primary" /> 평가 및 교재
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100/80 p-3 text-slate-500 font-medium">평가방법</div>
                <div className="p-3 text-slate-700">{syllabusData.evalMethod}</div>
                <div className="bg-slate-100/80 p-3 text-slate-500 font-medium border-t md:border-t-0 md:border-l border-slate-200">평가요소</div>
                <div className="p-3 text-slate-700">{syllabusData.evalElements}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100/80 p-3 text-slate-500 font-medium">교재</div>
                <div className="p-3 text-slate-700 md:col-span-3">{syllabusData.textbook}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                <div className="bg-slate-100/80 p-3 text-slate-500 font-medium">시험/과제</div>
                <div className="p-3 text-slate-700 md:col-span-3 whitespace-pre-wrap">{syllabusData.exams}</div>
              </div>
            </div>
          </section>

          {/* Overview & Goals */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <LayoutList size={18} className="text-primary" /> 수업 개요 및 목표
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-2">수업 개요</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{syllabusData.overview}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-3">수업 목표</h4>
                <ul className="space-y-2">
                  {syllabusData.goals.map((goal, i) => {
                    const [title, desc] = goal.split(':');
                    return (
                      <li key={i} className="text-sm text-slate-700 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"></span>
                        <div>
                          <span className="font-bold text-primary">{title}:</span> {desc}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>

          {/* Weekly Plan */}
          <section>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <CalendarDays size={18} className="text-primary" /> 주별 강의계획서
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/80 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">주차</th>
                    <th className="px-4 py-3 font-medium">강의범위 및 내용</th>
                    <th className="px-4 py-3 font-medium w-32 text-center">수업방식</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 bg-slate-50">
                  {syllabusData.weeklyPlan.map((plan) => (
                    <tr key={plan.week} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-600">{plan.week}주차</td>
                      <td className="px-4 py-3 text-slate-700">{plan.range}</td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">{plan.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
