import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Columns3, ListFilter, LogOut, Menu, RefreshCw, X } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { FilterPanel } from './components/FilterPanel';
import { CourseHeader } from './components/CourseHeader';
import { CourseCard } from './components/CourseCard';
import { PlannerView } from './components/PlannerView';
import { WishlistBoard } from './components/WishlistBoard';
import { courseService } from './services/courseService';
import { filterCourses, sortCourses, getCreditRange } from './utils/courseFilters';
import { mockCourses } from './data/mockData';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import type { Course, CourseCacheInfo, CoursePriority, FilterOptions } from './types/course';
import type { ManualScheduleSlot } from './utils/schedule';

type AppTab = 'catalog' | 'planner' | 'wishlist';

const INITIAL_FILTERS: FilterOptions = {
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
};

const TAB_ITEMS: Array<{ key: AppTab; label: string; icon: typeof ListFilter }> = [
  { key: 'catalog', label: 'Catalog', icon: ListFilter },
  { key: 'planner', label: 'Planner', icon: CalendarDays },
  { key: 'wishlist', label: 'Wishlist', icon: Columns3 }
];

function formatCacheTime(cacheInfo: CourseCacheInfo) {
  if (!cacheInfo.updatedAt) return 'Нет локального кэша';

  return `${cacheInfo.fromCache ? 'Из кэша' : 'Обновлено'} ${new Date(cacheInfo.updatedAt).toLocaleString()}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '';
}

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
  const [activeTab, setActiveTab] = useState<AppTab>('catalog');
  const [cacheInfo, setCacheInfo] = useState<CourseCacheInfo>({ updatedAt: null, fromCache: false });
  const [refreshingCourseUids, setRefreshingCourseUids] = useState<string[]>([]);

  const [plannerSubjectUids, setPlannerSubjectUids] = useLocalStorageState<string[]>(
    'auca_planner_subjects_v1',
    []
  );
  const [pinnedCourseBySubject, setPinnedCourseBySubject] = useLocalStorageState<Record<string, string>>(
    'auca_pinned_courses_v1',
    {}
  );
  const [manualSlotsBySubject, setManualSlotsBySubject] = useLocalStorageState<Record<string, ManualScheduleSlot>>(
    'auca_manual_slots_v1',
    {}
  );
  const [priorities, setPriorities] = useLocalStorageState<Record<string, CoursePriority>>(
    'auca_course_priorities_v1',
    {}
  );

  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);

  useEffect(() => {
    if (isAuthenticated && courses.length === 0 && !isDemoMode) {
      loadCourses(false);
    }
  }, [courses.length, isAuthenticated, isDemoMode]);

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
      const success = await courseService.authenticate(username, password);

      if (success) {
        setIsAuthenticated(true);
        setIsDemoMode(false);
        return true;
      }

      return false;
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
    setCacheInfo({ updatedAt: Date.now(), fromCache: false });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setCourses([]);
    setFilters(INITIAL_FILTERS);
    setActiveTab('catalog');
  };

  const loadCourses = async (forceRefresh = false) => {
    setIsLoading(true);
    setError('');

    try {
      const coursesData = await courseService.getAllCoursesWithDetails(forceRefresh);
      setCourses(coursesData);
      setCacheInfo(courseService.getCacheInfo());
    } catch (error: unknown) {
      console.error('Failed to load courses:', error);

      if (getErrorMessage(error) === 'UNAUTHORIZED') {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setIsAuthenticated(false);
      } else {
        setError('Ошибка загрузки предметов. Попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullRefresh = () => {
    courseService.clearCourseCache();
    loadCourses(true);
  };

  const handleRefreshCourse = async (course: Course) => {
    if (isDemoMode) return;

    setRefreshingCourseUids(prev => [...new Set([...prev, course.uid])]);
    setError('');

    try {
      const updatedCourse = await courseService.refreshCourseDetails(course);
      setCourses(prev => prev.map(item => item.uid === updatedCourse.uid ? updatedCourse : item));
      setCacheInfo(courseService.getCacheInfo());
    } catch (error: unknown) {
      console.error('Failed to refresh course:', error);

      if (getErrorMessage(error) === 'UNAUTHORIZED') {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setIsAuthenticated(false);
      } else {
        setError('Не удалось обновить этот курс. Попробуйте позже.');
      }
    } finally {
      setRefreshingCourseUids(prev => prev.filter(uid => uid !== course.uid));
    }
  };

  const handleAddToPlanner = (course: Course) => {
    setPlannerSubjectUids(prev => (
      prev.includes(course.discipline.uid) ? prev : [...prev, course.discipline.uid]
    ));
    setActiveTab('planner');
  };

  const handleRemoveSubject = (subjectUid: string) => {
    setPlannerSubjectUids(prev => prev.filter(uid => uid !== subjectUid));
    setPinnedCourseBySubject(prev => {
      const next = { ...prev };
      delete next[subjectUid];
      return next;
    });
    setManualSlotsBySubject(prev => {
      const next = { ...prev };
      delete next[subjectUid];
      return next;
    });
  };

  const handlePinCourse = (subjectUid: string, courseUid: string) => {
    setPinnedCourseBySubject(prev => {
      const next = { ...prev };
      if (courseUid) {
        next[subjectUid] = courseUid;
      } else {
        delete next[subjectUid];
      }
      return next;
    });
  };

  const handleSetManualSlot = (subjectUid: string, slot: ManualScheduleSlot | null) => {
    setManualSlotsBySubject(prev => {
      const next = { ...prev };
      if (slot) {
        next[subjectUid] = slot;
      } else {
        delete next[subjectUid];
      }
      return next;
    });
  };

  const handleSetPriority = (courseUid: string, priority: CoursePriority | null) => {
    setPriorities(prev => {
      const next = { ...prev };
      if (priority) {
        next[courseUid] = priority;
      } else {
        delete next[courseUid];
      }
      return next;
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = filterCourses(courses, filters);
    return sortCourses(filtered, sortBy, sortOrder);
  }, [courses, filters, sortBy, sortOrder]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onDemoMode={handleDemoMode} isLoading={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {activeTab === 'catalog' && (
                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
                  >
                    {isFilterPanelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    AUCA Course Viewer
                    {isDemoMode && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
                        Демо
                      </span>
                    )}
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">{formatCacheTime(cacheInfo)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                {TAB_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveTab(item.key)}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {!isDemoMode && (
                <button
                  type="button"
                  onClick={handleFullRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  title="Стереть локальный кэш и загрузить весь каталог заново"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Full refresh
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 transition-colors hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="mb-6 flex items-center justify-center rounded-xl border border-gray-200 bg-white py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="ml-4 text-lg text-gray-600">Загрузка предметов...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => loadCourses(false)}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-200"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className={`lg:w-80 ${isFilterPanelOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24">
                <FilterPanel
                  courses={courses}
                  filters={filters}
                  onFilterChange={setFilters}
                  isOpen={isFilterPanelOpen}
                  onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  useMockReferenceData={isDemoMode}
                />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {courses.length > 0 && !isLoading && (
                <CourseHeader
                  courses={courses}
                  filteredCourses={filteredAndSortedCourses}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              )}

              {courses.length > 0 && filteredAndSortedCourses.length === 0 && !isLoading && (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center shadow-sm">
                  <div className="mb-4 text-6xl text-gray-400">Search</div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Предметы не найдены</h3>
                  <p className="text-gray-600">Попробуйте изменить фильтры поиска</p>
                </div>
              )}

              <div className="grid gap-6">
                {filteredAndSortedCourses.map((course) => (
                  <CourseCard
                    key={course.uid}
                    course={course}
                    priority={priorities[course.uid]}
                    isPlanned={plannerSubjectUids.includes(course.discipline.uid)}
                    isRefreshing={refreshingCourseUids.includes(course.uid)}
                    onAddToPlanner={handleAddToPlanner}
                    onSetPriority={handleSetPriority}
                    onRefresh={isDemoMode ? undefined : handleRefreshCourse}
                  />
                ))}
              </div>

              {courses.length > 0 && filteredAndSortedCourses.length > 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-600">
                    Показано {filteredAndSortedCourses.length} из {courses.length} предметов
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <PlannerView
            courses={courses}
            selectedSubjectUids={plannerSubjectUids}
            pinnedCourseBySubject={pinnedCourseBySubject}
            manualSlotsBySubject={manualSlotsBySubject}
            onRemoveSubject={handleRemoveSubject}
            onPinCourse={handlePinCourse}
            onSetManualSlot={handleSetManualSlot}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistBoard
            courses={courses}
            priorities={priorities}
            onSetPriority={handleSetPriority}
            onAddToPlanner={handleAddToPlanner}
          />
        )}
      </div>
    </div>
  );
}

export default App;
