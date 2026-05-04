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
  
  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:8000/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-200 flex flex-col font-sans">
      <header className="bg-surface border-b border-slate-700 p-4 shadow-md z-10 relative">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl">
            <BookOpen size={28} />
            <span>AI Course Scheduler</span>
          </div>
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'search' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-slate-700'}`}
            >
              <Search size={18} /> 강의 검색
            </button>
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'timetable' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-slate-700'}`}
            >
              <Calendar size={18} /> 시간표/장바구니
            </button>
            <button 
              onClick={() => setActiveTab('credits')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'credits' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-slate-700'}`}
            >
              <Clock size={18} /> 학점 관리
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex gap-6 relative">
        <div className="flex-1 bg-surface rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col relative z-0">
          {activeTab === 'search' && <CourseSearch onAdd={() => fetchCart()} />}
          {activeTab === 'timetable' && <Timetable cart={cart} onRemove={() => fetchCart()} />}
          {activeTab === 'credits' && <CreditDashboard cart={cart} />}
        </div>
        
        <div className="w-96 bg-surface rounded-2xl shadow-xl border border-slate-700 flex flex-col relative z-0">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2 font-semibold">
            <MessageSquare className="text-accent" size={20} />
            AI 수강 비서
          </div>
          <Chatbot onUpdateCart={fetchCart} />
        </div>
      </main>
    </div>
  );
}

export default App;
