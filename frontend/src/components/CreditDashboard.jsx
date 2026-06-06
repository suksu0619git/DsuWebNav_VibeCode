import React from 'react';
import { PieChart, BookOpen, Award } from 'lucide-react';

export default function CreditDashboard({ cart }) {
  // Dummy student data
  const totalRequired = 130;
  const currentEarned = 110;
  
  const cartCredits = cart.reduce((sum, item) => sum + item.course.credits, 0);
  const prospectiveTotal = currentEarned + cartCredits;
  
  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold text-white mb-8">학점 관리 가이드</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">기존 이수 학점</p>
          <div className="text-4xl font-bold text-white mb-2">{currentEarned} <span className="text-lg text-slate-500 font-normal">/ {totalRequired}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${(currentEarned/totalRequired)*100}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">장바구니 담은 학점</p>
          <div className="text-4xl font-bold text-accent mb-2">+{cartCredits}</div>
          <p className="text-sm text-slate-500 mt-4">이번 학기 수강 예정 학점입니다.</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">예상 누적 학점</p>
          <div className="text-4xl font-bold text-green-400 mb-2">{prospectiveTotal} <span className="text-lg text-slate-500 font-normal">/ {totalRequired}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(prospectiveTotal/totalRequired)*100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-1">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-200 pb-4">분야별 필수 잔여 학점</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-slate-600">전공 필수</span>
              <span className="text-sm text-slate-500">잔여: 3학점 (목표: 30학점)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-slate-600">전공 선택</span>
              <span className="text-sm text-slate-500">잔여: 9학점 (목표: 40학점)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-purple-500 h-3 rounded-full" style={{ width: '77%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-slate-600">교양 필수/선택</span>
              <span className="text-sm text-slate-500">잔여: 8학점 (목표: 40학점)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
