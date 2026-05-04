import React from 'react';
import axios from 'axios';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Trash2, AlertTriangle } from 'lucide-react';

const localizer = momentLocalizer(moment);

export default function Timetable({ cart, onRemove }) {
  const events = cart.map(item => {
    // Dummy parsing logic for demo: "월1,수2" -> Monday 09:00, Wednesday 10:00
    // Real logic would map specific times
    return {
      title: item.course.title,
      start: new Date(2026, 3, 20, 9, 0), // Dummy date for demo
      end: new Date(2026, 3, 20, 10, 0),
      resource: item
    };
  });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/cart/${id}`);
      onRemove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">시간표 및 장바구니</h2>
          <p className="text-slate-400 text-sm">장바구니에 담긴 과목들의 시간표 초안입니다.</p>
        </div>
        <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-orange-500/20">
          <AlertTriangle size={16} />
          <span>경고: B동과 C동 사이 15분 이동이 어렵습니다. (데모)</span>
        </div>
      </div>
      
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 bg-slate-800/40 border border-slate-700 rounded-xl p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
          <h3 className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2">장바구니 목록 ({cart.length}개)</h3>
          {cart.map(item => (
            <div key={item.id} className="bg-slate-800 border border-slate-600 p-3 rounded-lg flex justify-between items-center group">
              <div>
                <h4 className="font-bold text-white text-sm">{item.course.title}</h4>
                <p className="text-xs text-slate-400">{item.course.code} | {item.course.credits}학점</p>
                <p className="text-xs text-slate-500">{item.course.schedule}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="text-sm text-slate-500 text-center mt-10">장바구니가 비어있습니다.</p>}
        </div>
        
        <div className="flex-1 bg-slate-50 text-slate-800 rounded-xl p-2 overflow-hidden timetable-wrapper">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="work_week"
            views={['work_week']}
            min={new Date(2026, 3, 20, 9, 0)}
            max={new Date(2026, 3, 20, 18, 0)}
            formats={{
              dayFormat: 'dddd'
            }}
            toolbar={false}
          />
        </div>
      </div>
    </div>
  );
}
