import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, BookOpen, Users, Clock } from 'lucide-react';
import type { Course } from '../types/course';

interface CourseHeaderProps {
  courses: Course[];
  filteredCourses: Course[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  courses,
  filteredCourses,
  sortBy,
  sortOrder,
  onSort
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const totalCredits = filteredCourses.reduce((sum, course) => sum + course.credit, 0);
  const avgCredits = filteredCourses.length > 0 ? (totalCredits / filteredCourses.length).toFixed(1) : 0;
  
  const languageStats = filteredCourses.reduce((stats, course) => {
    const lang = course.language.name;
    stats[lang] = (stats[lang] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  const semesterStats = filteredCourses.reduce((stats, course) => {
    const semester = course.groups_control_periods.name;
    stats[semester] = (stats[semester] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{filteredCourses.length}</div>
              <div className="text-sm text-gray-600">из {courses.length} предметов</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalCredits}</div>
              <div className="text-sm text-gray-600">всего кредитов</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{avgCredits}</div>
              <div className="text-sm text-gray-600">средние кредиты</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-lg font-semibold text-gray-900 mb-2">Языки</div>
              <div className="space-y-1">
                {Object.entries(languageStats).map(([lang, count]) => (
                  <div key={lang} className="text-xs text-gray-600">
                    {lang}: {count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Semester breakdown */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(semesterStats).map(([semester, count]) => (
            <span key={semester} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              {semester}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center mr-3">Сортировать по:</span>
          
          <button
            onClick={() => onSort('name')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              sortBy === 'name' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Название</span>
            {getSortIcon('name')}
          </button>
          
          <button
            onClick={() => onSort('code')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              sortBy === 'code' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Код</span>
            {getSortIcon('code')}
          </button>
          
          <button
            onClick={() => onSort('credits')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              sortBy === 'credits' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Кредиты</span>
            {getSortIcon('credits')}
          </button>
          
          <button
            onClick={() => onSort('semester')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              sortBy === 'semester' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Семестр</span>
            {getSortIcon('semester')}
          </button>
          
          <button
            onClick={() => onSort('prerequisites')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
              sortBy === 'prerequisites' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>Пререквизиты</span>
            {getSortIcon('prerequisites')}
          </button>
        </div>
      </div>
    </div>
  );
};
