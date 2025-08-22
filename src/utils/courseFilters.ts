import type { Course, FilterOptions } from '../types/course';

// Вспомогательная функция для конвертации времени в минуты
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const filterCourses = (courses: Course[], filters: FilterOptions): Course[] => {
  return courses.filter(course => {
    // Поиск по названию и аббревиатуре
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameMatch = course.discipline.name.toLowerCase().includes(searchLower);
      const abbrevMatch = course.discipline.courseabbreviation.toLowerCase().includes(searchLower);
      if (!nameMatch && !abbrevMatch) return false;
    }

    // Фильтр по семестру
    if (filters.semester && filters.semester !== 'all') {
      if (course.groups_control_periods.name !== filters.semester) return false;
    }

    // Фильтр по языку
    if (filters.language && filters.language !== 'all') {
      if (course.language.name !== filters.language) return false;
    }

    // Фильтр по циклу
    if (filters.cycle && filters.cycle !== 'all') {
      if (course.cycle.name !== filters.cycle) return false;
    }

    // Фильтр по компоненту
    if (filters.component && filters.component !== 'all') {
      if (course.component.name !== filters.component) return false;
    }

    // Фильтр по кредитам
    if (course.credit < filters.creditRange[0] || course.credit > filters.creditRange[1]) {
      return false;
    }

    // Фильтр по пререквизитам
    if (filters.hasPrerequisites !== 'all') {
      const hasPrereqs = course.prerequisites.length > 0;
      if (filters.hasPrerequisites === 'with' && !hasPrereqs) return false;
      if (filters.hasPrerequisites === 'without' && hasPrereqs) return false;
    }

    // Фильтр по формату обучения
    if (filters.trainingFormat && filters.trainingFormat !== 'all') {
      const hasFormat = course.flux.some(f => f.training_format.name === filters.trainingFormat);
      if (!hasFormat) return false;
    }

    // Фильтр по дням недели
    if (filters.daysOfWeek && filters.daysOfWeek.length > 0) {
      if (!course.details || course.details.length === 0) return false;
      
      const courseDays = course.details
        .filter(detail => detail.day_week)
        .map(detail => detail.day_week);
      
      const hasMatchingDay = filters.daysOfWeek.some(filterDay => 
        courseDays.includes(filterDay)
      );
      
      if (!hasMatchingDay) return false;
    }

    // Фильтр по доступности мест
    if (filters.isAvailableOnly) {
      if (!course.details || course.details.length === 0) return false;
      
      const hasAvailableSpots = course.details.some(detail => 
        detail.count > detail.number_of_students
      );
      
      if (!hasAvailableSpots) return false;
    }

    // Фильтр по времени
    if (filters.timeRange && (filters.timeRange.from !== '00:00' || filters.timeRange.to !== '23:59')) {
      if (!course.details || course.details.length === 0) return false;
      
      const filterFromMinutes = timeToMinutes(filters.timeRange.from);
      const filterToMinutes = timeToMinutes(filters.timeRange.to);
      
      const hasMatchingTime = course.details.some(detail => {
        if (!detail.from_time || !detail.to_time) return false;
        
        const detailFromMinutes = timeToMinutes(detail.from_time.substring(0, 5)); // берем только HH:mm часть
        const detailToMinutes = timeToMinutes(detail.to_time.substring(0, 5));
        
        // Проверяем пересечение временных интервалов
        return detailFromMinutes >= filterFromMinutes && detailToMinutes <= filterToMinutes;
      });
      
      if (!hasMatchingTime) return false;
    }

    return true;
  });
};

export const getUniqueValues = (courses: Course[], field: string): string[] => {
  const values = new Set<string>();
  
  courses.forEach(course => {
    switch (field) {
      case 'semester':
        values.add(course.groups_control_periods.name);
        break;
      case 'language':
        values.add(course.language.name);
        break;
      case 'cycle':
        values.add(course.cycle.name);
        break;
      case 'component':
        values.add(course.component.name);
        break;
      case 'trainingFormat':
        course.flux.forEach(f => values.add(f.training_format.name));
        break;
    }
  });
  
  return Array.from(values).sort();
};

export const getCreditRange = (courses: Course[]): [number, number] => {
  if (courses.length === 0) return [0, 10];
  
  const credits = courses.map(c => c.credit);
  return [Math.min(...credits), Math.max(...credits)];
};

export const sortCourses = (courses: Course[], sortBy: string, sortOrder: 'asc' | 'desc'): Course[] => {
  return [...courses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.discipline.name.localeCompare(b.discipline.name);
        break;
      case 'code':
        comparison = a.discipline.courseabbreviation.localeCompare(b.discipline.courseabbreviation);
        break;
      case 'credits':
        comparison = a.credit - b.credit;
        break;
      case 'semester':
        comparison = a.groups_control_periods.name.localeCompare(b.groups_control_periods.name);
        break;
      case 'prerequisites':
        comparison = a.prerequisites.length - b.prerequisites.length;
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};
