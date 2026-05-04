import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

export default function Chatbot({ onUpdateCart }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 수강신청 비서입니다. 무엇을 도와드릴까요? (예: "장바구니에 CS101 담아줘", "파이썬 관련 교양 추천해줘")' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      if (res.data.action_taken) {
        onUpdateCart();
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-accent' : 'bg-primary'}`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent/20 text-accent-50 rounded-tr-none' : 'bg-slate-700/50 text-slate-200 rounded-tl-none'}`}>
              {m.content.split('\n').map((line, j) => <p key={j}>{line}</p>)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-slate-700/50 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-800/30">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="AI에게 질문하기..."
            className="w-full bg-slate-900 border border-slate-600 rounded-full py-3 pl-5 pr-12 text-sm text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-accent hover:bg-accent/80 text-white rounded-full transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
