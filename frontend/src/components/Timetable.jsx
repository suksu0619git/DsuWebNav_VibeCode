import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle, Calendar, Info, Share2, Users, Wand2, Building2, Sparkles, X, Copy, Check, Download, QrCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

// 요일별 색상 팔레트 (붉은 테마와 어울리는 프로페셔널 톤: 레드, 차콜, 버건디, 스톤 등)
const COURSE_COLORS = [
  { bg: '#d22c2a', light: '#fef2f2', border: '#b91c1c' }, // 메인 레드
  { bg: '#475569', light: '#f8fafc', border: '#334155' }, // 슬레이트 (대비)
  { bg: '#9f1239', light: '#fff1f2', border: '#881337' }, // 버건디
  { bg: '#57534e', light: '#fafaf9', border: '#44403c' }, // 웜그레이
  { bg: '#be123c', light: '#ffe4e6', border: '#9f1239' }, // 로즈 레드
  { bg: '#3f3f46', light: '#f4f4f5', border: '#27272a' }, // 차콜
  { bg: '#c2410c', light: '#fff7ed', border: '#9a3412' }, // 테라코타
  { bg: '#78716c', light: '#f5f5f4', border: '#57534e' }, // 스톤
];

const DAYS = ['월', '화', '수', '목', '금'];
const DAY_FULL = { '월': '월요일', '화': '화요일', '수': '수요일', '목': '목요일', '금': '금요일' };

// 교시 정의: 1교시 = 09:00~10:00, ...
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PERIOD_TIME = {
  1: '09:00', 2: '10:00', 3: '11:00', 4: '12:00',
  5: '13:00', 6: '14:00', 7: '15:00', 8: '16:00', 9: '17:00'
};

/**
 * 시간표 스케줄 파싱 "월1,수2,수3" → [{day:'월', period:1}, ...]
 */
function parseSchedule(scheduleStr) {
  if (!scheduleStr) return [];
  return scheduleStr.split(',').map(s => {
    s = s.trim();
    const dayChar = s.charAt(0);
    const period = parseInt(s.substring(1), 10);
    if (!DAYS.includes(dayChar) || isNaN(period)) return null;
    return { day: dayChar, period };
  }).filter(Boolean);
}

/**
 * 연속된 교시를 블록으로 묶기 (같은 요일에서)
 */
function groupToBlocks(slots) {
  const byDay = {};
  slots.forEach(s => {
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(s.period);
  });

  const blocks = [];
  Object.entries(byDay).forEach(([day, periods]) => {
    periods.sort((a, b) => a - b);
    let start = periods[0];
    let count = 1;
    for (let i = 1; i < periods.length; i++) {
      if (periods[i] === periods[i - 1] + 1) {
        count++;
      } else {
        blocks.push({ day, startPeriod: start, span: count });
        start = periods[i];
        count = 1;
      }
    }
    blocks.push({ day, startPeriod: start, span: count });
  });
  return blocks;
}

export default function Timetable({ studentId, cart, onRemove, onSlotSelect, viewOnly = false }) {
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000');
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // 공유 및 비교 관련 상태
  const [allCourses, setAllCourses] = useState([]);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendCourses, setFriendCourses] = useState([]);
  const [copiedShareCode, setCopiedShareCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // AI 시간표 자동 스케줄러 관련 상태
  const [showAutoScheduler, setShowAutoScheduler] = useState(false);
  const [constraints, setConstraints] = useState({
    fridayFree: false,
    noMorning: false,
    lunchFree: false,
    minCredits: 12,
  });
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [hoveredOptionIdx, setHoveredOptionIdx] = useState(null);

  // QR 코드 모달 상태
  const [showQrModal, setShowQrModal] = useState(false);
  const timetableRef = React.useRef(null);

  // 모든 강의 목록 로드
  useEffect(() => {
    axios.get(`${API_URL}/courses?limit=3000`)
      .then(res => setAllCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  // 과목별 색상 할당
  const colorMap = {};
  cart.forEach((item, idx) => {
    colorMap[item.course.code] = COURSE_COLORS[idx % COURSE_COLORS.length];
  });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/cart/${id}`);
      onRemove();
    } catch (err) {
      console.error(err);
    }
  };

  // 시간표 셀 클릭 → 해당 시간대 과목 검색
  const handleCellClick = (day, period) => {
    if (onSlotSelect) {
      onSlotSelect(`${day}${period}`);
    }
  };

  // 내 시간표 공유 코드 생성 (과목 코드들의 쉼표 나열)
  const myShareCode = cart.map(item => item.course.code).join(',');

  const handleCopyShareCode = () => {
    navigator.clipboard.writeText(myShareCode);
    setCopiedShareCode(true);
    setTimeout(() => setCopiedShareCode(false), 2000);
  };

  // 친구 시간표 적용
  const handleApplyFriendCode = () => {
    if (!friendCodeInput.trim()) {
      setFriendCourses([]);
      return;
    }
    const codes = friendCodeInput.split(',').map(c => c.trim().toUpperCase());
    const matched = allCourses.filter(c => codes.includes(c.code.toUpperCase()));
    setFriendCourses(matched);
  };

  // 친구 시간표 초기화
  const handleClearFriend = () => {
    setFriendCodeInput('');
    setFriendCourses([]);
  };

  // AI 시간표 자동 생성 로직
  const handleGenerateSchedules = () => {
    let pool = allCourses.filter(c => {
      const slots = parseSchedule(c.schedule);
      if (constraints.fridayFree && slots.some(s => s.day === '금')) return false;
      if (constraints.noMorning && slots.some(s => s.period === 1)) return false;
      if (constraints.lunchFree && slots.some(s => s.period === 4)) return false;
      return true;
    });

    const results = [];
    const maxAttempts = 2000;

    for (let attempt = 0; attempt < maxAttempts && results.length < 3; attempt++) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const currentSelection = [];
      let currentCredits = 0;

      for (const course of shuffled) {
        let hasConflict = false;
        const cSlots = parseSchedule(course.schedule);

        for (const selected of currentSelection) {
          const sSlots = parseSchedule(selected.schedule);
          const overlaps = cSlots.some(cs => sSlots.some(ss => ss.day === cs.day && ss.period === cs.period));
          if (overlaps || selected.title === course.title) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          currentSelection.push(course);
          currentCredits += course.credits;

          if (currentCredits >= constraints.minCredits && currentCredits <= 18) {
            const sortedCodes = [...currentSelection].map(c => c.code).sort().join(',');
            if (!results.some(r => r.codesKey === sortedCodes)) {
              results.push({
                courses: [...currentSelection],
                credits: currentCredits,
                codesKey: sortedCodes
              });
            }
            if (results.length >= 3) break;
          }
        }
      }
    }
    setGeneratedOptions(results);
  };

  // 자동 생성된 시간표 적용
  const handleApplySchedule = async (selectedCourses) => {
    if (!window.confirm("현재 장바구니에 담긴 과목들이 지워지고 AI 추천 시간표로 대체됩니다. 진행하시겠습니까?")) {
      return;
    }
    try {
      // 1. 기존 카트 비우기
      for (const item of cart) {
        await axios.delete(`${API_URL}/cart/${item.id}`);
      }
      // 2. 새 과목들 카트에 추가
      for (const course of selectedCourses) {
        await axios.post(`${API_URL}/cart`, {
          course_id: course.id,
          user_id: studentId || "default"
        });
      }
      onRemove(); // 카트 갱신 트리거
      setShowAutoScheduler(false);
      setGeneratedOptions([]);
      alert('AI 시간표가 성공적으로 장바구니에 적용되었습니다!');
    } catch (err) {
      console.error(err);
      alert('시간표 적용 과정에서 오류가 발생했습니다.');
    }
  };

  // 시간표 이미지 다운로드
  const handleDownloadImage = async () => {
    if (!timetableRef.current) return;
    try {
      // 캡처 전 숨겨진 헤더 표시
      const header = timetableRef.current.querySelector('.print-header');
      if (header) header.style.display = 'block';
      
      const canvas = await html2canvas(timetableRef.current, { backgroundColor: '#ffffff', scale: 2 });
      
      // 캡처 후 다시 숨김
      if (header) header.style.display = 'none';

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `DSU_시간표_${studentId || '내'}.png`;
      link.click();
    } catch (err) {
      console.error("이미지 캡처 실패:", err);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  // 시간표에 표시할 내 과목 블록 생성
  const myTimetableBlocks = cart.flatMap(item => {
    const slots = parseSchedule(item.course.schedule);
    const blocks = groupToBlocks(slots);
    return blocks.map(block => ({
      ...block,
      item,
      isFriend: false,
      color: colorMap[item.course.code],
    }));
  });

  // 시간표에 표시할 친구 과목 블록 생성 (공유 비교용)
  const friendTimetableBlocks = friendCourses.flatMap(course => {
    const slots = parseSchedule(course.schedule);
    const blocks = groupToBlocks(slots);
    return blocks.map(block => ({
      ...block,
      item: { course },
      isFriend: true,
      color: { bg: '#e2e8f0', border: '#94a3b8' } // 회색조 색상 지정
    }));
  });

  // AI 시간표 미리보기용 블록 생성 (마우스 오버 시 일시적으로 시간표에 띄워줌)
  const previewTimetableBlocks = (hoveredOptionIdx !== null && generatedOptions[hoveredOptionIdx])
    ? generatedOptions[hoveredOptionIdx].courses.flatMap(course => {
        const slots = parseSchedule(course.schedule);
        const blocks = groupToBlocks(slots);
        return blocks.map(block => ({
          ...block,
          item: { course },
          isPreview: true,
          color: { bg: '#a855f7', border: '#7e22ce' } // 보라색 프리뷰
        }));
      })
    : [];

  // 세 종류의 블록들 통합
  const allTimetableBlocks = [
    ...myTimetableBlocks,
    ...friendTimetableBlocks,
    ...previewTimetableBlocks
  ];

  // 충돌 감지 (내 장바구니 기준)
  const conflicts = [];
  const occupied = {}; // key: "day-period" → courseCode
  cart.forEach(item => {
    parseSchedule(item.course.schedule).forEach(({ day, period }) => {
      const key = `${day}-${period}`;
      if (occupied[key] && occupied[key] !== item.course.code) {
        conflicts.push({ day, period, codes: [occupied[key], item.course.code] });
      }
      occupied[key] = item.course.code;
    });
  });

  // 캠퍼스 연강 동선 경고 계산
  const transitWarnings = [];
  const buildingMap = {}; // key: "day-period" → { building, courseTitle, location }

  cart.forEach(item => {
    const slots = parseSchedule(item.course.schedule);
    slots.forEach(({ day, period }) => {
      // 건물명 파싱 (예: "공학관 301호" -> "공학관")
      const building = item.course.location.split(' ')[0] || '';
      buildingMap[`${day}-${period}`] = { building, title: item.course.title, location: item.course.location };
    });
  });

  DAYS.forEach(day => {
    for (let p = 1; p < 9; p++) {
      const current = buildingMap[`${day}-${p}`];
      const next = buildingMap[`${day}-${p + 1}`];
      if (current && next && current.title !== next.title) {
        if (current.building && next.building && current.building !== next.building) {
          transitWarnings.push({
            day,
            periods: `${p}교시 → ${p + 1}교시`,
            from: current.building,
            to: next.building,
            courseFrom: current.title,
            courseTo: next.title,
            locFrom: current.location,
            locTo: next.location
          });
        }
      }
    }
  });

  const totalCredits = cart.reduce((sum, item) => sum + (item.course.credits || 0), 0);

  if (viewOnly) {
    return (
      <div className="w-full h-full bg-white overflow-auto relative">
        <div className="min-w-[600px] flex flex-col bg-white">
          <div className="text-center py-4 bg-primary text-white font-bold text-lg">
            {studentId}님의 시간표
          </div>
          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', background: '#ffffff', borderBottom: '2px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>교시</div>
            {DAYS.map(day => (
              <div key={day} style={{
                padding: '10px 4px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#475569',
                borderLeft: '1px solid #e2e8f0'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* 시간표 바디 */}
          <div className="flex-1 relative">
            {PERIODS.map(period => (
              <div key={period} style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ padding: '0', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '64px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{period}</span>
                  <span style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '2px' }}>{PERIOD_TIME[period]}</span>
                </div>
                {DAYS.map(day => (
                  <div key={day} style={{ borderLeft: '1px solid #e2e8f0', minHeight: '64px' }} />
                ))}
              </div>
            ))}

            {/* 과목 블록 오버레이 */}
            <div style={{ position: 'absolute', top: 0, left: '52px', right: 0, bottom: 0, pointerEvents: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {DAYS.map((day) => (
                <div key={day} style={{ position: 'relative' }}>
                  {allTimetableBlocks.filter(b => b.day === day).map((block, i) => {
                    const top = (block.startPeriod - 1) * 64;
                    const height = block.span * 64 - 3;
                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          top: `${top + 2}px`,
                          left: '3px',
                          right: '3px',
                          height: `${height}px`,
                          background: block.color.bg,
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          padding: '6px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', opacity: 0.9 }}>{block.item.course.code}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{block.item.course.title}</div>
                        {block.span >= 2 && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{block.item.course.location}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-5 gap-4 bg-slate-50 min-h-0 overflow-y-auto lg:overflow-hidden">
      
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center shrink-0 gap-3">
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#d22c2a" />
            내 시간표 및 빌더
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            장바구니 {cart.length}개 과목 · 총 {totalCredits}학점 {friendCourses.length > 0 && `(친구 시간표 오버레이 활성화)`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* AI 시간표 자동 빌더 버튼 */}
          <button
            onClick={() => { setShowAutoScheduler(!showAutoScheduler); setShowShareModal(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
              background: showAutoScheduler ? '#d22c2a' : '#ffffff', border: `1px solid ${showAutoScheduler ? '#b91c1c' : '#e2e8f0'}`,
              color: showAutoScheduler ? '#fff' : '#d22c2a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Wand2 size={15} />
            AI 자동 시간표 빌더
          </button>

          {/* 친구 시간표 비교 버튼 */}
          <button
            onClick={() => { setShowShareModal(!showShareModal); setShowAutoScheduler(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
              background: showShareModal ? '#475569' : '#ffffff', border: `1px solid ${showShareModal ? '#334155' : '#e2e8f0'}`,
              color: showShareModal ? '#fff' : '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Users size={15} />
            공유 & 비교
          </button>

          {/* 이미지 저장 버튼 */}
          <button
            onClick={handleDownloadImage}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
              background: '#57534e', border: '1px solid #44403c',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Download size={15} color="#fff" />
            이미지 저장
          </button>

          {/* QR 코드 버튼 */}
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
              background: '#78716c', border: '1px solid #57534e',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <QrCode size={15} color="#fff" />
            QR 보기
          </button>
        </div>
      </div>

      {/* 상단 알림 메시지 영역 (시간 충돌 및 이동 동선 경고) */}
      {(conflicts.length > 0 || transitWarnings.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {conflicts.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px' }}>
              <AlertTriangle size={16} />
              <span><strong>시간표 겹침 경고:</strong> 동일한 요일/교시에 겹치는 강의가 있습니다. 장바구니 항목을 확인하세요.</span>
            </div>
          )}
          {transitWarnings.map((warn, index) => (
            <div key={index} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '13px' }}>
              <Building2 size={16} />
              <span>
                <strong>연강 동선 경고:</strong> {warn.day}요일 {warn.periods} 연강 시 <strong>{warn.courseFrom} ({warn.locFrom})</strong> → <strong>{warn.courseTo} ({warn.locTo})</strong> 건물 간 이동이 필요해 시간이 촉박할 수 있습니다!
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 메인 레이아웃 */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* 왼쪽: 시간표 그리드 (캡처 대상 영역) */}
        <div ref={timetableRef} className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-300 overflow-hidden relative">
          <div className="overflow-x-auto flex-1 flex flex-col">
            <div style={{ minWidth: '600px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {/* 캡처 시 표시할 헤더 정보 (평소엔 숨기거나 작게 표시) */}
          <div style={{ display: 'none' }} className="print-header">
            <h3 style={{ margin: '10px 16px', fontSize: '18px', fontWeight: 'bold' }}>{studentId}님의 시간표</h3>
          </div>
          
          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', background: '#ffffff', borderBottom: '2px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>교시</div>
            {DAYS.map(day => (
              <div key={day} style={{
                padding: '10px 4px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#475569',
                borderLeft: '1px solid #e2e8f0'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* 시간표 바디 (스크롤 가능) */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              {PERIODS.map(period => (
                <div key={period} style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
                  {/* 교시/시간 레이블 */}
                  <div style={{ padding: '0', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '64px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{period}</span>
                    <span style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '2px' }}>{PERIOD_TIME[period]}</span>
                  </div>
                  {/* 각 요일 셀 */}
                  {DAYS.map(day => {
                    const conflictHere = conflicts.some(c => c.day === day && c.period === period);
                    return (
                      <div
                        key={day}
                        onClick={() => handleCellClick(day, period)}
                        style={{
                          borderLeft: '1px solid #e2e8f0',
                          minHeight: '64px',
                          position: 'relative',
                          cursor: 'pointer',
                          background: conflictHere ? 'rgba(239,68,68,0.05)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!conflictHere) e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = conflictHere ? 'rgba(239,68,68,0.05)' : 'transparent'; }}
                      />
                    );
                  })}
                </div>
              ))}

              {/* 과목 블록 오버레이 (절대 위치) */}
              <div style={{ position: 'absolute', top: 0, left: '52px', right: 0, bottom: 0, pointerEvents: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {DAYS.map((day, dayIdx) => (
                  <div key={day} style={{ position: 'relative' }}>
                    {allTimetableBlocks.filter(b => b.day === day).map((block, i) => {
                      const top = (block.startPeriod - 1) * 64;
                      const height = block.span * 64 - 3;
                      const isHovered = hoveredCourse === block.item.course.code;
                      const conflict = !block.isFriend && !block.isPreview && conflicts.some(c => c.day === day && c.period >= block.startPeriod && c.period < block.startPeriod + block.span);
                      
                      let bgStyle = block.color.bg;
                      let borderStyle = 'none';
                      let opacityStyle = 1;
                      
                      if (block.isFriend) {
                        // 친구 시간표 블록 스타일 (사선 무늬 오버레이)
                        bgStyle = 'repeating-linear-gradient(45deg, rgba(71,85,105,0.1), rgba(71,85,105,0.1) 8px, rgba(71,85,105,0.2) 8px, rgba(71,85,105,0.2) 16px)';
                        borderStyle = '2px dashed #475569';
                        opacityStyle = 0.9;
                      } else if (block.isPreview) {
                        // AI 프리뷰 블록 스타일 (로즈레드 번쩍임)
                        bgStyle = 'repeating-linear-gradient(45deg, rgba(190,18,60,0.2), rgba(190,18,60,0.2) 8px, rgba(190,18,60,0.45) 8px, rgba(190,18,60,0.45) 16px)';
                        borderStyle = '2px dashed #be123c';
                      }

                      return (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            top: `${top + 2}px`,
                            left: '3px',
                            right: '3px',
                            height: `${height}px`,
                            background: conflict ? 'rgba(239,68,68,0.85)' : bgStyle,
                            border: borderStyle,
                            opacity: opacityStyle,
                            borderRadius: '8px',
                            boxShadow: isHovered ? `0 4px 20px ${block.isPreview ? '#be123c' : block.isFriend ? '#475569' : block.color.bg}80` : '0 2px 8px rgba(0,0,0,0.3)',
                            padding: '6px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '2px',
                            cursor: 'pointer',
                            pointerEvents: 'all',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            zIndex: isHovered ? 10 : (block.isFriend || block.isPreview ? 2 : 5),
                            overflow: 'hidden',
                          }}
                          onMouseEnter={() => setHoveredCourse(block.item.course.code)}
                          onMouseLeave={() => setHoveredCourse(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTooltip(tooltip?.code === block.item.course.code ? null : { ...block.item.course, dayIdx, startPeriod: block.startPeriod });
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: 800, color: block.isFriend ? '#475569' : block.isPreview ? '#fbcfe8' : '#fff', opacity: 0.8 }}>
                            {block.isFriend ? '[친구] ' : block.isPreview ? '[추천] ' : ''}
                            {block.item.course.code}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {block.item.course.title}
                          </div>
                          {block.span >= 2 && (
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {block.item.course.location}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 패널 관리 (일반 장바구니 / AI 자동빌더 / 친구 공유) */}
        <div className="w-full lg:w-[280px] flex flex-col gap-3 shrink-0 mb-8 lg:mb-0">
          
          {/* 1. 친구 비교 패널 */}
          {showShareModal && (
            <div style={{ background: '#ffffff', border: '1px solid #475569', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={16} /> 친구 시간표 대조
                </span>
                <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              
              {/* 내 공유 코드 복사 */}
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>내 시간표 공유 코드</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    readOnly
                    value={myShareCode || '과목을 담아주세요.'}
                    style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: '#94a3b8', outline: 'none' }}
                  />
                  <button
                    onClick={handleCopyShareCode}
                    style={{ background: '#475569', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {copiedShareCode ? <Check size={14} color="#fff" /> : <Copy size={14} color="#fff" />}
                  </button>
                </div>
              </div>

              {/* 친구 공유 코드 입력 */}
              <div>
                <label style={{ fontSize: '11px', color: '#64748b' }}>친구의 코드 입력</label>
                <textarea
                  placeholder="예: CS101,CS202"
                  value={friendCodeInput}
                  onChange={e => setFriendCodeInput(e.target.value)}
                  style={{ width: '100%', height: '50px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', fontSize: '12px', color: '#1e293b', resize: 'none', marginTop: '4px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleApplyFriendCode}
                  style={{ flex: 1, background: '#475569', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  비교 오버레이 켜기
                </button>
                {friendCourses.length > 0 && (
                  <button
                    onClick={handleClearFriend}
                    style={{ background: '#e2e8f0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. AI 시간표 자동 빌더 패널 */}
          {showAutoScheduler && (
            <div style={{ background: '#ffffff', border: '1px solid #d22c2a', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#d22c2a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={16} /> AI 자동 조합 스케줄러
                </span>
                <button onClick={() => setShowAutoScheduler(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              {/* 제약조건 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={constraints.fridayFree}
                    onChange={e => setConstraints({ ...constraints, fridayFree: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  금요일 공강 만들기 (주4일)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={constraints.noMorning}
                    onChange={e => setConstraints({ ...constraints, noMorning: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  1교시 아침수업 제외 (09:00~)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={constraints.lunchFree}
                    onChange={e => setConstraints({ ...constraints, lunchFree: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  점심시간 보장 (12~13시 비우기)
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>최소 이수 학점</span>
                  <select
                    value={constraints.minCredits}
                    onChange={e => setConstraints({ ...constraints, minCredits: parseInt(e.target.value) })}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px', fontSize: '11px', color: '#1e293b' }}
                  >
                    <option value={9}>9학점 이상</option>
                    <option value={12}>12학점 이상</option>
                    <option value={15}>15학점 이상</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateSchedules}
                style={{ background: '#d22c2a', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                시간표 최적 조합 생성
              </button>

              {/* 생성된 결과 */}
              {generatedOptions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginTop: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>추천 시안 (마우스오버 시 미리보기)</div>
                  {generatedOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredOptionIdx(idx)}
                      onMouseLeave={() => setHoveredOptionIdx(null)}
                      style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>시안 {idx + 1} ({opt.credits}학점)</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>과목 {opt.courses.length}개 조합</span>
                      </div>
                      <button
                        onClick={() => handleApplySchedule(opt.courses)}
                        style={{ background: '#d22c2a', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                      >
                        적용
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. 장바구니 목록 패널 */}
          <div style={{ background: 'linear-gradient(135deg, #d22c2a, #9f1239)', borderRadius: '12px', padding: '14px', color: '#fff' }}>
            <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '4px' }}>이번 학기 예정 학점</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>{totalCredits}<span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.8 }}>학점</span></div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>장바구니에 {cart.length}개 과목 담김</div>
          </div>

          {/* 4. 장바구니 리스트 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', paddingLeft: '2px' }}>장바구니 목록 ({cart.length})</div>
            
            {cart.length === 0 && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', border: '1px dashed #e2e8f0' }}>
                <Calendar size={28} color="#e2e8f0" style={{ margin: '0 auto 8px' }} />
                장바구니가 비어있습니다
              </div>
            )}

            {cart.map(item => {
              const color = colorMap[item.course.code];
              const isHovered = hoveredCourse === item.course.code;
              const hasConflict = conflicts.some(c => {
                const slots = parseSchedule(item.course.schedule);
                return slots.some(s => s.day === c.day && s.period === c.period);
              });
              return (
                <div
                  key={item.id}
                  style={{
                    background: isHovered ? '#ffffff' : '#ffffff',
                    border: `1px solid ${isHovered ? color.bg : '#e2e8f0'}`,
                    borderLeft: `4px solid ${color.bg}`,
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={() => setHoveredCourse(item.course.code)}
                  onMouseLeave={() => setHoveredCourse(null)}
                >
                  {hasConflict && (
                    <div style={{ position: 'absolute', top: '8px', right: '32px', color: '#f87171' }}>
                      <AlertTriangle size={13} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.course.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                        {item.course.professor} · {item.course.credits}학점
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.course.schedule} | {item.course.location}
                      </div>
                      <div style={{ marginTop: '6px', display: 'inline-block', background: `${color.bg}22`, color: color.bg, borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: 600 }}>
                        {item.course.category}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', marginLeft: '4px', flexShrink: 0, borderRadius: '6px', transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 빈 셀 클릭 안내 */}
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '10px 12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={14} color="#6366f1" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>시간표 빈 칸을 클릭하면 해당 시간대 강의를 검색합니다</span>
          </div>
        </div>
      </div>

      {/* 과목 클릭 시 상세 툴팁 */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            border: `1px solid ${colorMap[tooltip.code]?.bg || '#6366f1'}`,
            borderRadius: '14px',
            padding: '16px 20px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '280px',
            maxWidth: '400px',
          }}
          onClick={() => setTooltip(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{tooltip.title}</span>
            <span style={{ fontSize: '12px', color: colorMap[tooltip.code]?.bg || '#6366f1', background: `${colorMap[tooltip.code]?.bg || '#6366f1'}22`, padding: '2px 8px', borderRadius: '6px' }}>{tooltip.credits}학점</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <div>📚 {tooltip.code}</div>
            <div>👨‍🏫 {tooltip.professor}</div>
            <div>⏰ {tooltip.schedule}</div>
            <div>📍 {tooltip.location}</div>
            <div>🏷️ {tooltip.category}</div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>클릭하여 닫기</div>
        </div>
      )}
      {/* QR 모달 */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '320px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowQrModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <div style={{ background: '#f59e0b', color: '#fff', padding: '10px', borderRadius: '50%' }}>
              <QrCode size={32} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>내 시간표 QR 코드</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>스마트폰으로 스캔하면 모바일 브라우저에서<br/>내 시간표를 그대로 볼 수 있습니다.</p>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', marginTop: '8px' }}>
              <QRCodeCanvas 
                value={`https://dsu-web-nav-vibe-code.vercel.app/?student_id=${studentId}&view_only=true`} 
                size={200}
                level={"M"}
              />
            </div>
            <button onClick={() => setShowQrModal(false)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
