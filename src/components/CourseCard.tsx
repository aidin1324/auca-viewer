import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar
} from 'lucide-react';
import type { Course } from '../types/course';
import { formatTeacherName, getDayOfWeekName, getCourseDetailTimeRange } from '../utils/courseDisplay';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const courseDetails = course.details || [];

  const getLanguageFlag = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'english': return '🇺🇸';
      case 'russian': return '🇷🇺';
      case 'kyrgyz': return '🇰🇬';
      default: return '🌐';
    }
  };

  const getCycleColor = (cycleName: string) => {
    switch (cycleName.toLowerCase()) {
      case 'general education': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'major requirements': return 'bg-green-100 text-green-800 border-green-200';
      case 'minor requirements': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'electives': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="course-card bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {course.discipline.name}
            </h3>
            <p className="text-sm font-medium text-blue-600 mb-2">
              {course.discipline.courseabbreviation}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getLanguageFlag(course.language.name)}</span>
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <BookOpen className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-600">
                {course.credit} кредитов
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCycleColor(course.cycle.name)}`}>
            {course.cycle.name}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {course.component.short_name}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            {course.groups_control_periods.name}
          </span>
          {course.flux.map((flux, index) => (
            <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {flux.training_format.name}
            </span>
          ))}
        </div>

        {/* Prerequisites */}
        {course.prerequisites.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Пререквизиты ({course.prerequisites.length})
              </span>
            </div>
            <div className="space-y-1">
              {course.prerequisites.slice(0, 2).map((prereq, index) => (
                <div key={index} className="text-xs text-gray-600 bg-amber-50 px-2 py-1 rounded border-l-2 border-amber-300">
                  {prereq.required_discipline_ser.name} ({prereq.required_discipline_ser.courseabbreviation})
                </div>
              ))}
              {course.prerequisites.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{course.prerequisites.length - 2} ещё
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Globe className="w-4 h-4 mr-2" />
            <span>{course.language.name}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{course.study_year.name}</span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="px-6 py-4">
        <button
          onClick={handleToggleDetails}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          <span>Детали секций и расписание</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {courseDetails.length > 0 ? (
              <div className="space-y-3">
                {courseDetails.map((detail, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="font-medium">{detail.load_type_name.name}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatTeacherName(detail.teacher)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{detail.room?.name || 'Не указана'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{getDayOfWeekName(detail.day_week || '')}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{getCourseDetailTimeRange(detail)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            {detail.count > 0 
                              ? `${detail.count}/${detail.number_of_students} мест`
                              : detail.number_of_students > 0 
                                ? `${detail.number_of_students} мест`
                                : 'Места не указаны'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">
                Информация о секциях недоступна
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
