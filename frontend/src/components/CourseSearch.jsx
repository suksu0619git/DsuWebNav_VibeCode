import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Plus, Search, Tag } from 'lucide-react';

export default function CourseSearch({ onAdd }) {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'major', 'general'
  const [displayCount, setDisplayCount] = useState(20);
  const observerTarget = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:8000/courses?limit=3000');
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  // Reset display count when search or tab changes
  useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm, activeTab]);

  // Infinite scroll intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget]);

  const filtered = courses.filter(c => {
    // 1. Tab Filtering
    let matchTab = true;
    if (activeTab === 'major') {
      matchTab = c.category.includes('전공');
    } else if (activeTab === 'general') {
      matchTab = c.category.includes('교양');
    }

    // 2. Search Term Filtering
    const matchSearch = 
      c.title.includes(searchTerm) || 
      c.tags.includes(searchTerm) ||
      c.professor.includes(searchTerm);

    return matchTab && matchSearch;
  });

  const displayCourses = filtered.slice(0, displayCount);

  const handleAdd = async (courseId) => {
    try {
      await axios.post('http://localhost:8000/cart', {
        course_id: courseId,
        user_id: 1
      });
      onAdd();
      alert('장바구니에 담겼습니다.');
    } catch (err) {
      console.error(err);
      alert('장바구니 담기에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4 relative">
        <input 
          type="text" 
          placeholder="강의명, 교수, 태그(예: 파이썬, 교양) 검색..."
          className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 px-12 text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          전체 보기
        </button>
        <button 
          onClick={() => setActiveTab('major')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'major' ? 'bg-primary text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          컴퓨터계열 (전공)
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          교양 과목
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pr-2">
        <div className="grid gap-4">
          {displayCourses.map(course => (
            <div key={course.id} className="bg-slate-800/40 border border-slate-700 p-5 rounded-xl hover:bg-slate-800 transition-colors flex justify-between items-center group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-700 rounded-md text-slate-300">{course.code}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded-md">{course.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{course.title} <span className="text-sm font-normal text-slate-400 ml-2">{course.credits}학점</span></h3>
                <p className="text-sm text-slate-400 mb-2">{course.professor} | {course.schedule} | {course.location}</p>
                <div className="flex gap-2">
                  {course.tags.split(',').map(tag => (
                    tag && (
                      <span key={tag} className="text-xs flex items-center gap-1 text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full">
                        <Tag size={10} /> {tag}
                      </span>
                    )
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleAdd(course.id)}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Plus size={24} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              검색 결과가 없습니다.
            </div>
          )}
          {/* Intersection Observer Target */}
          {displayCount < filtered.length && (
            <div ref={observerTarget} className="h-10 w-full flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
