import { useState, useEffect, useMemo } from 'react';
import { LoginForm } from './components/LoginForm';
import { FilterPanel } from './components/FilterPanel';
import { CourseHeader } from './components/CourseHeader';
import { CourseCard } from './components/CourseCard';
import { courseService } from './services/courseService';
import { filterCourses, sortCourses, getCreditRange } from './utils/courseFilters';
import { mockCourses } from './data/mockData';
import type { Course, FilterOptions } from './types/course';
import { LogOut, Menu, X } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    semester: 'all',
    language: 'all',
    cycle: 'all',
    component: 'all',
    creditRange: [0, 10],
    hasPrerequisites: 'all',
    trainingFormat: 'all',
    daysOfWeek: [],
    isAvailableOnly: false,
    timeRange: {
      from: '00:00',
      to: '23:59'
    }
  });

  // Load courses after authentication
  useEffect(() => {
    if (isAuthenticated && courses.length === 0 && !isDemoMode) {
      loadCourses();
    }
  }, [isAuthenticated, isDemoMode]); // Убираем courses.length из зависимостей

  // Update credit range when courses load
  useEffect(() => {
    if (courses.length > 0) {
      const range = getCreditRange(courses);
      setFilters(prev => ({
        ...prev,
        creditRange: range
      }));
    }
  }, [courses]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoggingIn(true);
    setError('');
    
    try {
      console.log('Attempting to authenticate...');
      const success = await courseService.authenticate(username, password);
      
      if (success) {
        console.log('Authentication successful, setting authenticated state...');
        setIsAuthenticated(true);
        setIsDemoMode(false);
        return true;
      } else {
        console.log('Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoMode = () => {
    setIsAuthenticated(true);
    setIsDemoMode(true);
    setCourses(mockCourses);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setCourses([]);
    setFilters({
      searchTerm: '',
      semester: 'all',
      language: 'all',
      cycle: 'all',
      component: 'all',
      creditRange: [0, 10],
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

  const loadCourses = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Loading courses with details...');
      const coursesData = await courseService.getAllCoursesWithDetails();
      console.log('Courses loaded successfully:', coursesData.length);
      setCourses(coursesData);
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      
      if (error.message === 'UNAUTHORIZED') {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setIsAuthenticated(false);
      } else {
        setError('Ошибка загрузки предметов. Попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Memoized filtered and sorted courses
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = filterCourses(courses, filters);
    return sortCourses(filtered, sortBy, sortOrder);
  }, [courses, filters, sortBy, sortOrder]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onDemoMode={handleDemoMode} isLoading={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isFilterPanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                AUCA Course Viewer
                {isDemoMode && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Демо
                  </span>
                )}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Panel */}
          <div className={`lg:w-80 ${isFilterPanelOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <FilterPanel
                courses={courses}
                filters={filters}
                onFilterChange={setFilters}
                isOpen={isFilterPanelOpen}
                onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-lg text-gray-600">Загрузка предметов...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={loadCourses}
                    className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

            {/* Course Header with Stats and Sorting */}
            {courses.length > 0 && !isLoading && (
              <CourseHeader
                courses={courses}
                filteredCourses={filteredAndSortedCourses}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )}

            {/* No Results */}
            {courses.length > 0 && filteredAndSortedCourses.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Предметы не найдены</h3>
                <p className="text-gray-600">Попробуйте изменить фильтры поиска</p>
              </div>
            )}

            {/* Course Cards */}
            <div className="grid gap-6">
              {filteredAndSortedCourses.map((course) => (
                <CourseCard key={course.uid} course={course} />
              ))}
            </div>

            {/* Load More Button */}
            {courses.length > 0 && filteredAndSortedCourses.length > 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600">
                  Показано {filteredAndSortedCourses.length} из {courses.length} предметов
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
