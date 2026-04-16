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
  Calendar,
  RefreshCw,
  Target
} from 'lucide-react';
import type { Course, CoursePriority } from '../types/course';
import { formatTeacherName, getDayOfWeekName, getCourseDetailTimeRange } from '../utils/courseDisplay';
import { describeStatusReason, getCourseAvailability } from '../utils/courseStatus';

interface CourseCardProps {
  course: Course;
  priority?: CoursePriority;
  isPlanned?: boolean;
  isRefreshing?: boolean;
  onAddToPlanner?: (course: Course) => void;
  onSetPriority?: (courseUid: string, priority: CoursePriority | null) => void;
  onRefresh?: (course: Course) => void;
}

const PRIORITY_LABELS: Record<CoursePriority, string> = {
  must: 'Must take',
  nice: 'Nice to have',
  backup: 'Backup',
  avoid: 'Avoid'
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  priority,
  isPlanned = false,
  isRefreshing = false,
  onAddToPlanner,
  onSetPriority,
  onRefresh
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const courseDetails = course.details || [];
  const availability = getCourseAvailability(course);

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
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {course.discipline.name}
            </h3>
            <p className="text-sm font-medium text-blue-600 mb-2">
              {course.discipline.courseabbreviation}
            </p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${availability.tone}`}>
              {availability.label}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row gap-2 xl:items-end">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getLanguageFlag(course.language.name)}</span>
              <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                <BookOpen className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-blue-600">
                  {course.credit} кредитов
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAddToPlanner?.(course)}
                disabled={!onAddToPlanner || isPlanned}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isPlanned
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } disabled:cursor-default`}
              >
                <Target className="w-4 h-4" />
                {isPlanned ? 'В плане' : 'В план'}
              </button>
              <button
                type="button"
                onClick={() => onRefresh?.(course)}
                disabled={!onRefresh || isRefreshing}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                title="Обновить только этот курс"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {onSetPriority && (
              <select
                value={priority || ''}
                onChange={(event) => onSetPriority(course.uid, event.target.value ? event.target.value as CoursePriority : null)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Wishlist priority"
              >
                <option value="">Priority</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            )}
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
        <p className="mt-4 text-xs leading-5 text-gray-500">
          {describeStatusReason(course)}
        </p>
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
                            {detail.number_of_students > 0 ? (
                              detail.count > 0 ? (
                                <span className={detail.count < detail.number_of_students ? 'text-green-600' : 'text-red-600'}>
                                  {detail.count}/{detail.number_of_students} мест
                                  {detail.count < detail.number_of_students && ' (доступно)'}
                                  {detail.count >= detail.number_of_students && ' (занято)'}
                                </span>
                              ) : (
                                <span className="text-green-600">
                                  0/{detail.number_of_students} мест (доступно)
                                </span>
                              )
                            ) : (
                              'Места не указаны'
                            )}
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
