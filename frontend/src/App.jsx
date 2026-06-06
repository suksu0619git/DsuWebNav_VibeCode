import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, MessageSquare, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import Chatbot from './components/Chatbot';
import Timetable from './components/Timetable';
import CourseSearch from './components/CourseSearch';
import CreditDashboard from './components/CreditDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [cart, setCart] = useState([]);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [initialSearchTab, setInitialSearchTab] = useState('all');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  
  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, []);

  const handleSlotSelect = (timeQuery) => {
    setInitialSearchTerm(timeQuery);
    setInitialSearchTab('general'); // 교양 탭으로 기본 설정
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 flex flex-col font-sans pt-20">
      <header className="fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-b border-slate-700 px-6 py-4 shadow-lg z-50 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 text-primary font-extrabold text-2xl tracking-tight">
            <BookOpen size={28} className="text-accent" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Scheduler</span>
          </div>
          <nav className="flex gap-2">
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'search' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Search size={18} /> 강의 검색
            </button>
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Calendar size={18} /> 시간표/장바구니
            </button>
            <button 
              onClick={() => setActiveTab('credits')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'credits' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Clock size={18} /> 학점 관리
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 relative">
        <div className="flex-1 bg-surface rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col relative z-0">
          {activeTab === 'search' && <CourseSearch onAdd={() => fetchCart()} initialSearchTerm={initialSearchTerm} initialTab={initialSearchTab} />}
          {activeTab === 'timetable' && <Timetable cart={cart} onRemove={() => fetchCart()} onSlotSelect={handleSlotSelect} />}
          {activeTab === 'credits' && <CreditDashboard cart={cart} />}
        </div>
        
        {/* Floating AI Chatbot Button */}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent/80 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
        >
          {isChatbotOpen ? <span className="text-2xl font-bold">×</span> : <MessageSquare size={28} />}
        </button>

        {/* Floating Chat Window */}
        {isChatbotOpen && (
          <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-surface rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-accent" size={20} />
                AI 수강 비서
              </div>
              <button onClick={() => setIsChatbotOpen(false)} className="text-slate-400 hover:text-white text-xl">
                ×
              </button>
            </div>
            <Chatbot onUpdateCart={fetchCart} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
