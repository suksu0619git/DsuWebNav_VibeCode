import React, { useState } from 'react';
import axios from 'axios';
import { Trash2, AlertTriangle, Calendar, Info } from 'lucide-react';

// 요일별 색상 팔레트 (에브리타임 스타일)
const COURSE_COLORS = [
  { bg: '#4a90d9', light: '#e8f1fb', border: '#3a7bc8' },
  { bg: '#e8734a', light: '#fdf0eb', border: '#d4623b' },
  { bg: '#5cb85c', light: '#eaf6ea', border: '#4aa84a' },
  { bg: '#9b59b6', light: '#f3eaf9', border: '#8b49a6' },
  { bg: '#e91e8c', light: '#fce4f3', border: '#d40e7c' },
  { bg: '#00bcd4', light: '#e0f7fa', border: '#00acc1' },
  { bg: '#ff9800', light: '#fff3e0', border: '#f57c00' },
  { bg: '#795548', light: '#efebe9', border: '#6d4c41' },
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
 * [{day:'월', period:1}, {day:'월', period:2}] → [{day:'월', startPeriod:1, span:2}]
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

export default function Timetable({ cart, onRemove, onSlotSelect }) {
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // 과목별 색상 할당
  const colorMap = {};
  cart.forEach((item, idx) => {
    colorMap[item.course.code] = COURSE_COLORS[idx % COURSE_COLORS.length];
  });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/cart/${id}`);
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

  // 시간표에 표시할 블록 생성
  const timetableBlocks = cart.flatMap(item => {
    const slots = parseSchedule(item.course.schedule);
    const blocks = groupToBlocks(slots);
    return blocks.map(block => ({
      ...block,
      item,
      color: colorMap[item.course.code],
    }));
  });

  // 충돌 감지
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

  const totalCredits = cart.reduce((sum, item) => sum + (item.course.credits || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', gap: '16px', background: '#0f172a', minHeight: 0 }}>
      
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#6366f1" />
            내 시간표
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            장바구니에 담긴 {cart.length}개 과목 · 총 {totalCredits}학점
          </p>
        </div>
        {conflicts.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '13px' }}>
            <AlertTriangle size={15} />
            시간 충돌 {conflicts.length}건 감지됨
          </div>
        )}
      </div>

      {/* 메인 레이아웃 */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>

        {/* 왼쪽: 시간표 그리드 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '14px', border: '1px solid #334155', overflow: 'hidden' }}>
          
          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', background: '#1e293b', borderBottom: '2px solid #334155', flexShrink: 0 }}>
            <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', color: '#475569' }}>교시</div>
            {DAYS.map(day => (
              <div key={day} style={{
                padding: '10px 4px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: day === '월' ? '#6366f1' : day === '수' ? '#22d3ee' : day === '금' ? '#f472b6' : '#94a3b8',
                borderLeft: '1px solid #334155'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* 시간표 바디 (스크롤 가능) */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              {PERIODS.map(period => (
                <div key={period} style={{ display: 'grid', gridTemplateColumns: '52px repeat(5, 1fr)', borderBottom: '1px solid #1e3a5f' }}>
                  {/* 교시/시간 레이블 */}
                  <div style={{ padding: '0', textAlign: 'center', borderRight: '1px solid #334155', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '64px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{period}</span>
                    <span style={{ fontSize: '10px', color: '#334155', marginTop: '2px' }}>{PERIOD_TIME[period]}</span>
                  </div>
                  {/* 각 요일 셀 */}
                  {DAYS.map(day => {
                    const conflictHere = conflicts.some(c => c.day === day && c.period === period);
                    return (
                      <div
                        key={day}
                        onClick={() => handleCellClick(day, period)}
                        style={{
                          borderLeft: '1px solid #1e3a5f',
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
                  <div key={day} style={{ position: 'relative', borderLeft: dayIdx === 0 ? 'none' : '1px solid transparent' }}>
                    {timetableBlocks.filter(b => b.day === day).map((block, i) => {
                      const top = (block.startPeriod - 1) * 64;
                      const height = block.span * 64 - 3;
                      const isHovered = hoveredCourse === block.item.course.code;
                      const conflict = conflicts.some(c => c.day === day && c.period >= block.startPeriod && c.period < block.startPeriod + block.span);
                      return (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            top: `${top + 2}px`,
                            left: '3px',
                            right: '3px',
                            height: `${height}px`,
                            background: conflict ? 'rgba(239,68,68,0.85)' : block.color.bg,
                            borderRadius: '8px',
                            boxShadow: isHovered ? `0 4px 20px ${block.color.bg}80` : '0 2px 8px rgba(0,0,0,0.3)',
                            padding: '6px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '2px',
                            cursor: 'pointer',
                            pointerEvents: 'all',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            zIndex: isHovered ? 10 : 1,
                            overflow: 'hidden',
                          }}
                          onMouseEnter={() => setHoveredCourse(block.item.course.code)}
                          onMouseLeave={() => setHoveredCourse(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTooltip(tooltip?.code === block.item.course.code ? null : { ...block.item.course, dayIdx, startPeriod: block.startPeriod });
                          }}
                        >
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {block.item.course.title}
                          </div>
                          {block.span >= 2 && (
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {block.item.course.professor}
                            </div>
                          )}
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

        {/* 오른쪽: 장바구니 목록 */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          
          {/* 학점 요약 */}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', padding: '14px', color: '#fff' }}>
            <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '4px' }}>신청 학점</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>{totalCredits}<span style={{ fontSize: '14px', fontWeight: 400, opacity: 0.8 }}>학점</span></div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>{cart.length}개 과목 선택됨</div>
          </div>

          {/* 과목 목록 */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', paddingLeft: '2px' }}>장바구니 ({cart.length})</div>
            
            {cart.length === 0 && (
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#475569', fontSize: '13px', border: '1px dashed #334155' }}>
                <Calendar size={28} color="#334155" style={{ margin: '0 auto 8px' }} />
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
                    background: isHovered ? '#1e293b' : '#1a2332',
                    border: `1px solid ${isHovered ? color.bg : '#334155'}`,
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
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.course.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                        {item.course.professor} · {item.course.credits}학점
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        {item.course.schedule} | {item.course.location}
                      </div>
                      <div style={{ marginTop: '6px', display: 'inline-block', background: `${color.bg}22`, color: color.bg, borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: 600 }}>
                        {item.course.category}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px', marginLeft: '4px', flexShrink: 0, borderRadius: '6px', transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 빈 셀 클릭 안내 */}
          <div style={{ background: '#1e293b', borderRadius: '10px', padding: '10px 12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            background: '#1e293b',
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
            <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{tooltip.title}</span>
            <span style={{ fontSize: '12px', color: colorMap[tooltip.code]?.bg, background: `${colorMap[tooltip.code]?.bg}22`, padding: '2px 8px', borderRadius: '6px' }}>{tooltip.credits}학점</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <div>📚 {tooltip.code}</div>
            <div>👨‍🏫 {tooltip.professor}</div>
            <div>⏰ {tooltip.schedule}</div>
            <div>📍 {tooltip.location}</div>
            <div>🏷️ {tooltip.category}</div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', textAlign: 'center' }}>클릭하여 닫기</div>
        </div>
      )}
    </div>
  );
}
