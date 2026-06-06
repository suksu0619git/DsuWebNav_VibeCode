import React, { useState, useEffect } from 'react';
import { PieChart, BookOpen, Award, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CreditDashboard({ studentId, cart }) {
  // 졸업 요건 (고정값)
  const reqMajorReq = 30;
  const reqMajorEle = 40;
  const reqGeneral = 40;
  const reqTotal = 130;

  // 기이수 학점 (상태)
  const [earnedMajorReq, setEarnedMajorReq] = useState(0);
  const [earnedMajorEle, setEarnedMajorEle] = useState(0);
  const [earnedGeneral, setEarnedGeneral] = useState(0);
  
  // 로컬 스토리지에서 기이수 학점 불러오기
  useEffect(() => {
    if (studentId) {
      const saved = localStorage.getItem(`dsu_credits_${studentId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setEarnedMajorReq(parsed.earnedMajorReq || 0);
        setEarnedMajorEle(parsed.earnedMajorEle || 0);
        setEarnedGeneral(parsed.earnedGeneral || 0);
      } else {
        // 기본값 세팅
        setEarnedMajorReq(0);
        setEarnedMajorEle(0);
        setEarnedGeneral(0);
      }
    }
  }, [studentId]);

  // 기이수 학점 변경 시 저장
  const handleSaveCredits = () => {
    const data = { earnedMajorReq, earnedMajorEle, earnedGeneral };
    localStorage.setItem(`dsu_credits_${studentId}`, JSON.stringify(data));
    alert('기이수 학점이 저장되었습니다.');
  };

  const currentEarned = Number(earnedMajorReq) + Number(earnedMajorEle) + Number(earnedGeneral);
  
  // 이번 학기 장바구니에 담긴 학점 계산 (분야별)
  let cartMajorReq = 0;
  let cartMajorEle = 0;
  let cartGeneral = 0;
  
  cart.forEach(item => {
    const cat = item.course.category;
    const cred = item.course.credits;
    if (cat.includes('전공필수')) cartMajorReq += cred;
    else if (cat.includes('전공선택')) cartMajorEle += cred;
    else cartGeneral += cred;
  });

  const cartCreditsTotal = cartMajorReq + cartMajorEle + cartGeneral;
  const prospectiveTotal = currentEarned + cartCreditsTotal;

  // 잔여 학점 계산 (필수 최소 0)
  const remMajorReq = Math.max(0, reqMajorReq - earnedMajorReq);
  const remMajorEle = Math.max(0, reqMajorEle - earnedMajorEle);
  const remGeneral = Math.max(0, reqGeneral - earnedGeneral);

  // 예상 잔여 학점 (장바구니 포함)
  const prosRemMajorReq = Math.max(0, remMajorReq - cartMajorReq);
  const prosRemMajorEle = Math.max(0, remMajorEle - cartMajorEle);
  const prosRemGeneral = Math.max(0, remGeneral - cartGeneral);

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">졸업 학점 관리 가이드</h2>
          <p className="text-slate-500 mt-2">{studentId || '학생'}님의 4년 주기 졸업 요건 현황입니다.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">총 기이수 학점</p>
          <div className="text-4xl font-bold text-slate-800 mb-2">{currentEarned} <span className="text-lg text-slate-500 font-normal">/ {reqTotal}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (currentEarned/reqTotal)*100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">장바구니 담은 학점</p>
          <div className="text-4xl font-bold text-primary mb-2">+{cartCreditsTotal}</div>
          <p className="text-sm text-slate-500 mt-4">이번 학기 수강 예정 학점입니다.</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart size={120} />
          </div>
          <p className="text-slate-500 font-semibold mb-1">예상 누적 학점</p>
          <div className="text-4xl font-bold text-green-600 mb-2">{prospectiveTotal} <span className="text-lg text-slate-500 font-normal">/ {reqTotal}</span></div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (prospectiveTotal/reqTotal)*100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기이수 학점 입력 폼 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">기이수 학점 입력</h3>
          <p className="text-sm text-slate-500 mb-6">지난 학기까지 이수한 학점을 정확히 입력해주세요. (목표 졸업학점: 130)</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 w-32">전공 필수</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={earnedMajorReq} onChange={e => setEarnedMajorReq(e.target.value)} className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-center" />
                <span className="text-slate-500">/ {reqMajorReq}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 w-32">전공 선택</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={earnedMajorEle} onChange={e => setEarnedMajorEle(e.target.value)} className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-center" />
                <span className="text-slate-500">/ {reqMajorEle}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 w-32">교양 필수/선택</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={earnedGeneral} onChange={e => setEarnedGeneral(e.target.value)} className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-center" />
                <span className="text-slate-500">/ {reqGeneral}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSaveCredits}
            className="w-full mt-6 bg-primary hover:bg-secondary text-white font-bold py-3 rounded-xl transition-colors shadow-md"
          >
            저장 및 업데이트
          </button>
        </div>

        {/* 잔여 학점 및 추천 가이드 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">분야별 필수 잔여 학점</h3>
          
          <div className="space-y-6 mb-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-600">전공 필수</span>
                <span className="text-sm font-bold text-blue-600">잔여: {remMajorReq}학점</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (earnedMajorReq/reqMajorReq)*100)}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-600">전공 선택</span>
                <span className="text-sm font-bold text-purple-600">잔여: {remMajorEle}학점</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (earnedMajorEle/reqMajorEle)*100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-slate-600">교양 필수/선택</span>
                <span className="text-sm font-bold text-emerald-600">잔여: {remGeneral}학점</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (earnedGeneral/reqGeneral)*100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-primary" /> AI 수강 추천 가이드
            </h4>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              {remMajorReq > 0 && <li><strong>전공필수</strong>가 {remMajorReq}학점 남았습니다. 졸업이 지연되지 않도록 가급적 이번 학기에 이수하세요. {cartMajorReq === 0 && <span className="text-red-500">(현재 장바구니에 없음)</span>}</li>}
              {remMajorEle > 0 && <li><strong>전공선택</strong> 학점을 {remMajorEle}학점 더 채워야 합니다.</li>}
              {remGeneral > 0 && <li><strong>교양</strong>이 {remGeneral}학점 부족합니다. 교양 과목을 병행하여 수강하세요.</li>}
              {currentEarned >= reqTotal && <li>🎉 축하합니다! 이미 졸업 요구 학점을 모두 채웠습니다.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
