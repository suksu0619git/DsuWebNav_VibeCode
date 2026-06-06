import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, MessageSquare, BookOpen, Clock } from 'lucide-react';
import Chatbot from './components/Chatbot';
import Timetable from './components/Timetable';
import CourseSearch from './components/CourseSearch';
import CreditDashboard from './components/CreditDashboard';
import Home from './components/Home';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [initialSearchTab, setInitialSearchTab] = useState('all');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000');

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSlotSelect = (timeQuery) => {
    setInitialSearchTerm(timeQuery);
    setInitialSearchTab('general');
    setActiveTab('search');
  };

  const handleAskAI = (query) => {
    setInitialChatMessage(query);
    setIsChatbotOpen(true);
  };

  const isHome = activeTab === 'home';

  const navItems = [
    { key: 'search',    icon: <Search size={16} />,   label: '강의 검색' },
    { key: 'timetable', icon: <Calendar size={16} />, label: '시간표/장바구니' },
    { key: 'credits',   icon: <Clock size={16} />,    label: '학점 관리' },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans ${isHome ? '' : 'pt-16'}`}>

      {/* ── Top Navigation Bar (서브페이지에서만 표시) ── */}
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-6 py-0 flex items-stretch h-14">

            {/* 로고 / 홈으로 */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 text-primary font-extrabold text-lg tracking-tight hover:opacity-75 transition-opacity pr-6 border-r border-slate-200 mr-2"
            >
              <BookOpen size={22} className="text-primary" />
              <span className="text-primary hidden sm:inline">DSU AI 수강비서</span>
            </button>

            {/* 3개 탭 버튼 */}
            <nav className="flex items-stretch gap-0">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`
                    flex items-center gap-2 px-5 h-full text-sm font-semibold transition-all border-b-2 -mb-[2px]
                    ${activeTab === item.key
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-slate-500 hover:text-primary hover:bg-slate-50'
                    }
                  `}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>

          </div>
        </header>
      )}

      {/* ── Main Content ── */}
      <main className={`flex-1 ${isHome ? '' : 'max-w-7xl w-full mx-auto p-4'} relative`}>
        {isHome ? (
          <Home setActiveTab={setActiveTab} onAskAI={handleAskAI} />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 5rem)' }}>
            {activeTab === 'search'    && <CourseSearch onAdd={fetchCart} initialSearchTerm={initialSearchTerm} initialTab={initialSearchTab} />}
            {activeTab === 'timetable' && <Timetable cart={cart} onRemove={fetchCart} onSlotSelect={handleSlotSelect} />}
            {activeTab === 'credits'   && <CreditDashboard cart={cart} />}
          </div>
        )}
      </main>

      {/* ── Floating AI Chatbot Button ── */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50"
        title="AI 수강 비서"
      >
        {isChatbotOpen
          ? <span className="text-2xl font-bold leading-none">×</span>
          : <MessageSquare size={26} />
        }
      </button>

      {/* ── Floating Chat Window ── */}
      {isChatbotOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow">
                <MessageSquare size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">AI 수강 비서</span>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <Chatbot onUpdateCart={fetchCart} initialMessage={initialChatMessage} />
        </div>
      )}
    </div>
  );
}

export default App;
