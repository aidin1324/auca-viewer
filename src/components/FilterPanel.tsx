import React, { useEffect, useState } from 'react';
import { Search, Filter, X, SlidersHorizontal, Clock, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { Course, FilterOptions, DayOfWeek } from '../types/course';
import { getUniqueValues, getCreditRange } from '../utils/courseFilters';
import { courseService } from '../services/courseService';
import { mockDaysOfWeek } from '../data/mockData';

interface FilterPanelProps {
  courses: Course[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
  useMockReferenceData?: boolean;
}

interface QuickFiltersProps {
  filters: FilterOptions;
  onFilterUpdate: (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => void;
  uniqueSemesters: string[];
  uniqueLanguages: string[];
  creditRange: [number, number];
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFilterUpdate: (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => void;
  uniqueCycles: string[];
  uniqueComponents: string[];
  uniqueFormats: string[];
  daysOfWeek: DayOfWeek[];
}

// Компонент быстрых фильтров (наиболее часто используемые)
const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFilterUpdate,
  uniqueSemesters,
  uniqueLanguages,
  creditRange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
      >
        <span className="font-medium text-gray-900">Основные фильтры</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Credit Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Кредиты: {filters.creditRange[0]} - {filters.creditRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={creditRange[0]}
                max={creditRange[1]}
                value={filters.creditRange[0]}
                onChange={(e) => onFilterUpdate('creditRange', [Number(e.target.value), filters.creditRange[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={creditRange[0]}
                max={creditRange[1]}
                value={filters.creditRange[1]}
                onChange={(e) => onFilterUpdate('creditRange', [filters.creditRange[0], Number(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Семестр</label>
            <select
              value={filters.semester}
              onChange={(e) => onFilterUpdate('semester', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все семестры</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Язык обучения</label>
            <select
              value={filters.language}
              onChange={(e) => onFilterUpdate('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все языки</option>
              {uniqueLanguages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент расширенных фильтров (менее часто используемые)
const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterUpdate,
  uniqueCycles,
  uniqueComponents,
  uniqueFormats,
  daysOfWeek
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
      >
        <span className="font-medium text-gray-900">Расширенные фильтры</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цикл</label>
            <select
              value={filters.cycle}
              onChange={(e) => onFilterUpdate('cycle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все циклы</option>
              {uniqueCycles.map(cycle => (
                <option key={cycle} value={cycle}>{cycle}</option>
              ))}
            </select>
          </div>

          {/* Component */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Компонент</label>
            <select
              value={filters.component}
              onChange={(e) => onFilterUpdate('component', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все компоненты</option>
              {uniqueComponents.map(component => (
                <option key={component} value={component}>{component}</option>
              ))}
            </select>
          </div>

          {/* Training Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Формат обучения</label>
            <select
              value={filters.trainingFormat}
              onChange={(e) => onFilterUpdate('trainingFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все форматы</option>
              {uniqueFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пререквизиты</label>
            <select
              value={filters.hasPrerequisites}
              onChange={(e) => onFilterUpdate('hasPrerequisites', e.target.value as 'all' | 'with' | 'without')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все</option>
              <option value="with">С пререквизитами</option>
              <option value="without">Без пререквизитов</option>
            </select>
          </div>

          {/* Days of Week Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              Дни недели
            </label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map(day => (
                <label key={day.uid} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.daysOfWeek.includes(day.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFilterUpdate('daysOfWeek', [...filters.daysOfWeek, day.code]);
                      } else {
                        onFilterUpdate('daysOfWeek', filters.daysOfWeek.filter(d => d !== day.code));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{day.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Users className="w-4 h-4 mr-2" />
              Доступность мест
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isAvailableOnly}
                onChange={(e) => onFilterUpdate('isAvailableOnly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Только с доступными местами</span>
            </label>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 mr-2" />
              Время занятий
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">С</label>
                <input
                  type="time"
                  value={filters.timeRange.from}
                  onChange={(e) => onFilterUpdate('timeRange', { ...filters.timeRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">До</label>
                <input
                  type="time"
                  value={filters.timeRange.to}
                  onChange={(e) => onFilterUpdate('timeRange', { ...filters.timeRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  courses,
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  useMockReferenceData = false
}) => {
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);

  // Загружаем справочные данные при монтировании компонента
  useEffect(() => {
    const loadReferenceData = async () => {
      if (useMockReferenceData) {
        setDaysOfWeek(mockDaysOfWeek);
        return;
      }

      try {
        const [days] = await Promise.all([
          courseService.getDaysOfWeek()
        ]);
        setDaysOfWeek(days);
      } catch (error) {
        console.error('Failed to load reference data:', error);
      }
    };
    
    loadReferenceData();
  }, [useMockReferenceData]);

  const creditRange = getCreditRange(courses);
  const uniqueSemesters = getUniqueValues(courses, 'semester');
  const uniqueLanguages = getUniqueValues(courses, 'language');
  const uniqueCycles = getUniqueValues(courses, 'cycle');
  const uniqueComponents = getUniqueValues(courses, 'component');
  const uniqueFormats = getUniqueValues(courses, 'trainingFormat');

  const handleFilterUpdate = (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFilterChange({
      searchTerm: '',
      semester: 'all',
      language: 'all',
      cycle: 'all',
      component: 'all',
      creditRange: creditRange,
      hasPrerequisites: 'all',
      trainingFormat: 'all',
      daysOfWeek: [],
      isAvailableOnly: false,
      timeRange: {
        from: '00:00',
        to: '23:59'
      }
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm ||
           filters.semester !== 'all' ||
           filters.language !== 'all' ||
           filters.cycle !== 'all' ||
           filters.component !== 'all' ||
           filters.hasPrerequisites !== 'all' ||
           filters.trainingFormat !== 'all' ||
           filters.creditRange[0] !== creditRange[0] ||
           filters.creditRange[1] !== creditRange[1] ||
           filters.daysOfWeek.length > 0 ||
           filters.isAvailableOnly ||
           filters.timeRange.from !== '00:00' ||
           filters.timeRange.to !== '23:59';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-20 max-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Активны
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Сбросить</span>
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors lg:hidden"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search - всегда видимый */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Поиск по названию или коду предмета..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterUpdate('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Scrollable Filters Content */}
      <div className={`transition-all duration-300 overflow-y-auto max-h-[calc(100vh-16rem)] ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="p-4 space-y-4">
          {/* Быстрые фильтры */}
          <QuickFilters 
            filters={filters}
            onFilterUpdate={handleFilterUpdate}
            uniqueSemesters={uniqueSemesters}
            uniqueLanguages={uniqueLanguages}
            creditRange={creditRange}
          />

          {/* Расширенные фильтры */}
          <AdvancedFilters
            filters={filters}
            onFilterUpdate={handleFilterUpdate}
            uniqueCycles={uniqueCycles}
            uniqueComponents={uniqueComponents}
            uniqueFormats={uniqueFormats}
            daysOfWeek={daysOfWeek}
          />
        </div>
      </div>
    </div>
  );
};
