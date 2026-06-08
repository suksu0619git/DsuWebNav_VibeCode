import React, { useState } from 'react';
import { Search, Calendar, BookOpen, Clock, Sparkles, MessageSquare } from 'lucide-react';

export default function Home({ setActiveTab, onAskAI }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query);
      setQuery('');
    }
  };

  const navButtons = [
    {
      key: 'search',
      icon: <Search size={24} />,
      label: '강의 검색',
      desc: '원하는 강의를 빠르게 찾기',
      bg: 'hover:bg-red-50 hover:border-red-200',
    },
    {
      key: 'timetable',
      icon: <Calendar size={24} />,
      label: '시간표 / 장바구니',
      desc: '내 수강 계획 한눈에 보기',
      bg: 'hover:bg-red-50 hover:border-red-200',
    },
    {
      key: 'credits',
      icon: <Clock size={24} />,
      label: '학점 관리',
      desc: '졸업까지 남은 학점 확인',
      bg: 'hover:bg-red-50 hover:border-red-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/40 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex flex-col items-center mb-10" style={{ animation: 'fadeInDown 0.6s ease both' }}>
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full scale-150 pointer-events-none"></div>
          <div className="relative bg-white border-2 border-primary/20 p-5 rounded-3xl shadow-xl">
            <BookOpen size={52} className="text-primary" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight text-center leading-tight">
          동서대학교
          <br />
          <span className="text-primary">AI 수강 비서</span>
        </h1>

        <p className="mt-4 text-slate-500 text-base md:text-lg text-center max-w-md leading-relaxed">
          AI에게 무엇이든 물어보세요!<br />
          <span className="text-slate-400 text-sm">수강 추천·시간표 구성·꿀강의 정보까지 한 번에</span>
        </p>
      </div>

      {/* AI Search Bar */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-2xl mb-10"
        style={{ animation: 'fadeInUp 0.6s ease 0.1s both' }}
      >
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-40 py-5 text-base md:text-lg border-2 border-slate-300 rounded-full bg-white shadow-lg text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-xl outline-none"
            placeholder="예: 꿀교양 추천해줘, 금공강 시간표 짜줘"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-2.5 right-2.5 px-5 bg-primary hover:bg-secondary text-white rounded-full font-bold transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <MessageSquare size={16} />
            <span className="text-sm">AI에게 묻기</span>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          버튼을 클릭하면 AI 채팅창이 열립니다
        </p>
      </form>

      {/* 3 Navigation Buttons → 클릭 시 해당 서브페이지로 이동 */}
      <div
        className="flex flex-wrap justify-center gap-5 w-full max-w-2xl"
        style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}
      >
        {navButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveTab(btn.key)}
            className={`
              flex flex-col items-center gap-3 bg-white border-2 border-slate-300
              px-8 py-6 rounded-2xl font-semibold text-sm
              shadow-md hover:shadow-lg transition-all duration-200
              hover:scale-105 active:scale-95 group w-44
              ${btn.bg}
            `}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-sm">
              {btn.icon}
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm leading-tight">
                {btn.label}
              </div>
              <div className="text-xs font-normal text-slate-400 mt-1 leading-snug">
                {btn.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
