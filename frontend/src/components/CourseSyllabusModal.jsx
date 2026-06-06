import React from 'react';
import { X, Book, User, Mail, Phone, Info, LayoutList, Award, CalendarDays } from 'lucide-react';

export default function CourseSyllabusModal({ course, onClose }) {
  if (!course) return null;

  // Parse real syllabus data from backend if available, otherwise use mock data as fallback
  let syllabusData = {
    yearTerm: "2026 1학기",
    type: course.category || "전공선택",
    creditInfo: `이론: ${course.credits || 3} 실습: 0`,
    email: "-",
    lab: "미정",
    tel: "-",
    counseling: "-",
    foreignLang: "미실시",
    evalMethod: "상대평가",
    evalElements: "-",
    textbook: "-",
    goals: ["수업 목표가 등록되지 않았습니다."],
    overview: "수업 개요가 등록되지 않았습니다.",
    advice: "-",
    exams: "-",
    assignments: "-",
    weeklyPlan: []
  };

  if (course.syllabus) {
    try {
      const parsed = JSON.parse(course.syllabus);
      syllabusData = { ...syllabusData, ...parsed };
    } catch (e) {
      console.error("Failed to parse course syllabus:", e);
    }
  }

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
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
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
