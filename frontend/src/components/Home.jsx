import React, { useState } from 'react';
import { Search, Calendar, BookOpen, Clock, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import CourseSearch from './CourseSearch';
import Timetable from './Timetable';
import CreditDashboard from './CreditDashboard';

export default function Home({ setActiveTab, onAskAI, cart, fetchCart }) {
  const [query, setQuery] = useState('');
  const [activePanel, setActivePanel] = useState(null); // null | 'search' | 'timetable' | 'credits'

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query);
      setQuery('');
    }
  };

  const handlePanelToggle = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const navButtons = [
    {
      key: 'search',
      icon: <Search size={22} />,
      label: '강의 검색',
      desc: '원하는 강의를 빠르게 찾기',
      color: 'from-red-500 to-red-600',
    },
    {
      key: 'timetable',
      icon: <Calendar size={22} />,
      label: '시간표 / 장바구니',
      desc: '내 수강 계획 한눈에 보기',
      color: 'from-rose-500 to-pink-600',
    },
    {
      key: 'credits',
      icon: <Clock size={22} />,
      label: '학점 관리',
      desc: '졸업까지 남은 학점 확인',
      color: 'from-red-600 to-red-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex flex-col">
      
      {/* Top-right nav pills */}
      <header className="w-full flex justify-end px-8 pt-6">
        <nav className="flex gap-2">
          {navButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setActiveTab(btn.key)}
              className="text-sm text-slate-500 hover:text-primary px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all font-medium"
            >
              {btn.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 pt-8 pb-4">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-[fadeInDown_0.6s_ease]">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150"></div>
            <div className="relative bg-white border-2 border-primary/20 p-5 rounded-3xl shadow-xl">
              <BookOpen size={52} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight text-center leading-tight">
            동서대학교
            <br />
            <span className="bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">AI 수강 비서</span>
          </h1>
          <p className="mt-4 text-slate-500 text-base md:text-lg text-center max-w-md leading-relaxed">
            AI에게 무엇이든 물어보세요!<br />
            <span className="text-slate-400 text-sm">수강 추천, 시간표 구성, 꿀강의 정보까지</span>
          </p>
        </div>

        {/* Main AI Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-10 animate-[fadeInUp_0.6s_ease_0.1s_both]">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-36 py-5 text-base md:text-lg border-2 border-slate-200 rounded-full bg-white shadow-lg text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-xl outline-none"
              placeholder="예: 꿀교양 추천해줘, 금공강 시간표 짜줘"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-2.5 right-2.5 px-5 bg-primary hover:bg-secondary text-white rounded-full font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline text-sm">AI에게 묻기</span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            Enter를 누르거나 버튼을 클릭하면 AI 채팅창이 열립니다
          </p>
        </form>

        {/* 3 Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-3xl mb-6 animate-[fadeInUp_0.6s_ease_0.2s_both]">
          {navButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => handlePanelToggle(btn.key)}
              className={`
                relative flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm
                transition-all duration-200 hover:scale-105 active:scale-95 group
                shadow-md hover:shadow-lg
                ${activePanel === btn.key
                  ? 'bg-primary text-white shadow-primary/30 shadow-lg scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-primary/30 hover:bg-primary/5'
                }
              `}
            >
              <span className={`${activePanel === btn.key ? 'text-white' : 'text-primary'} transition-colors`}>
                {btn.icon}
              </span>
              <div className="text-left">
                <div className="font-bold">{btn.label}</div>
                <div className={`text-xs font-normal ${activePanel === btn.key ? 'text-white/80' : 'text-slate-400'}`}>
                  {btn.desc}
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`ml-auto transition-transform ${activePanel === btn.key ? 'rotate-90 text-white/80' : 'text-slate-300 group-hover:text-primary'}`}
              />
            </button>
          ))}
        </div>

        {/* 전체 화면으로 보기 버튼 */}
        {activePanel && (
          <button
            onClick={() => setActiveTab(activePanel)}
            className="mb-4 text-sm text-primary hover:underline flex items-center gap-1 animate-[fadeIn_0.3s_ease]"
          >
            전체 화면으로 보기 <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Inline Panel */}
      {activePanel && (
        <div className="w-full max-w-6xl mx-auto px-4 pb-8 animate-[fadeInUp_0.3s_ease]">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden" style={{ minHeight: '500px' }}>
            {activePanel === 'search' && (
              <CourseSearch onAdd={fetchCart} />
            )}
            {activePanel === 'timetable' && (
              <Timetable cart={cart} onRemove={fetchCart} onSlotSelect={() => {}} />
            )}
            {activePanel === 'credits' && (
              <CreditDashboard cart={cart} />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
