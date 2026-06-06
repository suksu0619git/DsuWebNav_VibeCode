import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Search, Tag, X, FileText } from 'lucide-react';
import CourseSyllabusModal from './CourseSyllabusModal';

export default function CourseSearch({ onAdd, initialSearchTerm = '', initialTab = 'all' }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeTab, setActiveTab] = useState(initialTab); // 'all', 'major', 'general'
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState(null);
  const observerTarget = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/courses?limit=3000`);
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  // Reset display count when search or tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayCount(20);
  }, [searchTerm, activeTab, selectedTags]);
  
  useEffect(() => {
    if (initialSearchTerm !== searchTerm) setSearchTerm(initialSearchTerm);
    if (initialTab !== activeTab) setActiveTab(initialTab);
  }, [initialSearchTerm, initialTab]);

  const allTags = [...new Set(courses.flatMap(c => c.tags.split(',').map(t => t.trim()).filter(Boolean)))];
  const relatedTags = searchTerm 
    ? allTags.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedTags.includes(t))
    : [];

  const handleAddTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm) {
      // If there's an exact match in related tags, or just use the first suggestion
      if (relatedTags.length > 0) {
        handleAddTag(relatedTags[0]);
      } else {
        handleAddTag(searchTerm);
      }
    } else if (e.key === 'Backspace' && !searchTerm && selectedTags.length > 0) {
      // Remove last tag when pressing backspace on empty input
      const newTags = [...selectedTags];
      newTags.pop();
      setSelectedTags(newTags);
    }
  };

  // Infinite scroll intersection observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );
    
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
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

    // 2. Tag Filtering (AND condition)
    const courseTags = c.tags.split(',').map(t => t.trim());
    const matchTags = selectedTags.every(tag => courseTags.includes(tag) || c.title.includes(tag) || c.professor.includes(tag));

    // 3. Search Term Filtering
    const matchSearch = searchTerm === '' ||
      c.title.includes(searchTerm) || 
      c.tags.includes(searchTerm) ||
      c.professor.includes(searchTerm) ||
      c.schedule.includes(searchTerm);

    return matchTab && matchTags && matchSearch;
  });

  const displayCourses = filtered.slice(0, displayCount);

  const handleAdd = async (courseId) => {
    try {
      await axios.post(`${API_URL}/cart`, {
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
    <div className="flex flex-col h-full p-6 relative">
      <div className="mb-4 relative z-20">
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 border border-slate-600 rounded-xl p-2 min-h-[50px] transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <Search className="text-slate-400 ml-2" size={20} />
          
          {selectedTags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              <Tag size={12} /> {tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-white transition-colors"><X size={14} /></button>
            </span>
          ))}

          <input 
            ref={searchInputRef}
            type="text" 
            placeholder={selectedTags.length === 0 ? "강의명, 교수, 태그(예: 파이썬) 검색..." : "태그 추가 검색..."}
            className="flex-1 bg-transparent border-none py-1 px-2 text-slate-200 focus:outline-none min-w-[150px]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && relatedTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden z-30">
            <div className="p-2 text-xs font-bold text-slate-400 bg-slate-900/50">연관 태그 추천 (Enter로 선택)</div>
            <ul className="max-h-48 overflow-y-auto">
              {relatedTags.map(tag => (
                <li 
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="px-4 py-2 hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors flex items-center gap-2 text-slate-200"
                >
                  <Tag size={14} /> {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showSuggestions && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
      )}

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
                  {course.is_pn_eligible && (
                    <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md shadow-sm">P/N 가능</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{course.title} <span className="text-sm font-normal text-slate-400 ml-2">{course.credits}학점</span></h3>
                <p className="text-sm text-slate-400 mb-2">{course.professor} | {course.schedule} | {course.location}</p>
                <div className="flex gap-2">
                  {course.tags.split(',').map(tag => {
                    const trimmed = tag.trim();
                    if (!trimmed) return null;
                    const isSelected = selectedTags.includes(trimmed);
                    return (
                      <button 
                        key={trimmed} 
                        onClick={() => isSelected ? handleRemoveTag(trimmed) : handleAddTag(trimmed)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isSelected ? 'bg-primary/30 text-primary font-bold shadow-sm border border-primary/30' : 'text-slate-400 bg-slate-900/50 hover:bg-slate-700'}`}
                      >
                        <Tag size={10} /> {trimmed}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleAdd(course.id)}
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-3 rounded-xl transition-all"
                  title="장바구니 담기"
                >
                  <Plus size={20} />
                </button>
                <button 
                  onClick={() => setSelectedCourseForSyllabus(course)}
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white p-3 rounded-xl transition-all"
                  title="강의계획서 보기"
                >
                  <FileText size={20} />
                </button>
              </div>
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

      <CourseSyllabusModal 
        course={selectedCourseForSyllabus} 
        onClose={() => setSelectedCourseForSyllabus(null)} 
      />
    </div>
  );
}
