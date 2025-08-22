import type { Course, FilterOptions } from '../types/course';
import { courseService } from '../services/courseService';
import { mockDaysOfWeek, mockTimeSlots } from '../data/mockData';

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

    // Комбинированная проверка деталей курса (дни недели, время, доступность)
    const needsDetailCheck = (
      (filters.daysOfWeek && filters.daysOfWeek.length > 0) ||
      filters.isAvailableOnly ||
      (filters.timeRange && (filters.timeRange.from !== '00:00' || filters.timeRange.to !== '23:59'))
    );

    if (needsDetailCheck) {
      if (!course.details || course.details.length === 0) return false;
      
      // Найти детали, которые удовлетворяют всем активным фильтрам одновременно
      const hasValidDetail = course.details.some(detail => {
        // Проверка дня недели
        if (filters.daysOfWeek && filters.daysOfWeek.length > 0) {
          if (!detail.day_week) return false;
          
          // Получаем день недели по UID
          const dayOfWeek = courseService.getDayOfWeekByUid(detail.day_week);
          let dayMatches = false;
          
          if (!dayOfWeek) {
            // Fallback: ищем в mock данных
            const mockDay = mockDaysOfWeek.find(d => d.uid === detail.day_week);
            if (!mockDay) return false;
            dayMatches = filters.daysOfWeek.includes(mockDay.code);
          } else {
            dayMatches = filters.daysOfWeek.includes(dayOfWeek.code);
          }
          
          if (!dayMatches) return false;
        }

        // Проверка доступности мест
        if (filters.isAvailableOnly) {
          // Если number_of_students = 0, места не указаны - пропускаем
          if (detail.number_of_students === 0) return false;
          
          // Если count = 0, скорее всего никто не записан - есть места
          if (detail.count === 0) {
            // Продолжаем проверку других условий
          } else {
            // Если занято больше или равно чем всего мест - нет свободных мест
            if (detail.count >= detail.number_of_students) return false;
          }
        }

        // Проверка времени
        if (filters.timeRange && (filters.timeRange.from !== '00:00' || filters.timeRange.to !== '23:59')) {
          if (!detail.from_time) return false;
          
          const filterFromMinutes = timeToMinutes(filters.timeRange.from);
          const filterToMinutes = timeToMinutes(filters.timeRange.to);
          
          // Получаем временной слот по UID
          const timeSlot = courseService.getTimeSlotByUid(detail.from_time);
          let timeMatches = false;
          
          if (!timeSlot) {
            // Fallback: ищем в mock данных
            const mockSlot = mockTimeSlots.find(t => t.uid === detail.from_time);
            if (!mockSlot) return false;
            
            const detailFromMinutes = timeToMinutes(mockSlot.from_time.substring(0, 5));
            const detailToMinutes = timeToMinutes(mockSlot.to_time.substring(0, 5));
            
            // Проверяем пересечение временных интервалов
            timeMatches = !(detailToMinutes <= filterFromMinutes || detailFromMinutes >= filterToMinutes);
          } else {
            const detailFromMinutes = timeToMinutes(timeSlot.from_time.substring(0, 5));
            const detailToMinutes = timeToMinutes(timeSlot.to_time.substring(0, 5));
            
            // Проверяем пересечение временных интервалов
            timeMatches = !(detailToMinutes <= filterFromMinutes || detailFromMinutes >= filterToMinutes);
          }
          
          if (!timeMatches) return false;
        }

        // Если дошли до сюда, значит все условия выполнены для этой детали
        return true;
      });
      
      if (!hasValidDetail) return false;
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
