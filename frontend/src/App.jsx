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

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans ${isHome ? '' : 'pt-16'}`}>
      
      {/* Header - Sub-pages only */}
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-sm z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 text-primary font-extrabold text-xl tracking-tight hover:opacity-80 transition-opacity"
            >
              <BookOpen size={24} className="text-primary" />
              <span className="text-primary">DSU AI 수강비서</span>
            </button>
            <nav className="flex gap-1">
              <button 
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:text-primary hover:bg-primary/5'}`}
              >
                <Search size={16} /> 강의 검색
              </button>
              <button 
                onClick={() => setActiveTab('timetable')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'timetable' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:text-primary hover:bg-primary/5'}`}
              >
                <Calendar size={16} /> 시간표/장바구니
              </button>
              <button 
                onClick={() => setActiveTab('credits')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'credits' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:text-primary hover:bg-primary/5'}`}
              >
                <Clock size={16} /> 학점 관리
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isHome ? '' : 'max-w-7xl w-full mx-auto p-4'} flex gap-6 relative`}>
        {isHome ? (
          <div className="flex-1 flex flex-col">
            <Home
              setActiveTab={setActiveTab}
              onAskAI={handleAskAI}
              cart={cart}
              fetchCart={fetchCart}
            />
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative z-0">
            {activeTab === 'search' && <CourseSearch onAdd={() => fetchCart()} initialSearchTerm={initialSearchTerm} initialTab={initialSearchTab} />}
            {activeTab === 'timetable' && <Timetable cart={cart} onRemove={() => fetchCart()} onSlotSelect={handleSlotSelect} />}
            {activeTab === 'credits' && <CreditDashboard cart={cart} />}
          </div>
        )}
        
        {/* Floating AI Chatbot Button */}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
          title="AI 수강 비서"
        >
          {isChatbotOpen ? <span className="text-2xl font-bold leading-none">×</span> : <MessageSquare size={26} />}
        </button>

        {/* Floating Chat Window */}
        {isChatbotOpen && (
          <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-800">AI 수강 비서</span>
              </div>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xl transition-colors leading-none"
              >
                ×
              </button>
            </div>
            <Chatbot onUpdateCart={fetchCart} initialMessage={initialChatMessage} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
