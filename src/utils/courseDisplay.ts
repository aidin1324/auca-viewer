import { courseService } from '../services/courseService';
import { mockDaysOfWeek, mockTimeSlots } from '../data/mockData';

// Форматирование имени преподавателя
export function formatTeacherName(teacher: any): string {
  if (!teacher) return 'Не указан';
  
  // Если есть готовое поле name_initial, используем его
  if (teacher.name_initial) {
    return teacher.name_initial;
  }
  
  // Если есть firstName и lastName, формируем из них
  if (teacher.firstName && teacher.lastName) {
    const middleInitial = teacher.middleName ? ` ${teacher.middleName.charAt(0)}.` : '';
    return `${teacher.lastName} ${teacher.firstName.charAt(0)}.${middleInitial}`;
  }
  
  return 'Не указан';
}

// Получение названия дня недели по UID
export function getDayOfWeekName(dayUid: string): string {
  if (!dayUid) return 'Не указан';
  
  // Сначала пытаемся получить из сервиса
  const day = courseService.getDayOfWeekByUid(dayUid);
  if (day) {
    return day.name;
  }
  
  // Если не найден, ищем в mock данных
  const mockDay = mockDaysOfWeek.find(d => d.uid === dayUid || d.code === dayUid);
  if (mockDay) {
    return mockDay.name;
  }
  
  console.warn(`Day of week not found for UID: ${dayUid}`);
  return `День не найден (${dayUid.substring(0, 8)}...)`;
}

// Получение времени по UID временного слота
export function getTimeSlotTime(timeUid: string): string {
  if (!timeUid) return 'Не указано';
  
  // Сначала пытаемся получить из сервиса
  const timeSlot = courseService.getTimeSlotByUid(timeUid);
  if (timeSlot) {
    return `${formatTime(timeSlot.from_time)} - ${formatTime(timeSlot.to_time)}`;
  }
  
  // Если не найден, ищем в mock данных
  const mockSlot = mockTimeSlots.find(t => t.uid === timeUid);
  if (mockSlot) {
    return `${formatTime(mockSlot.from_time)} - ${formatTime(mockSlot.to_time)}`;
  }
  
  console.warn(`Time slot not found for UID: ${timeUid}`);
  return `Время не найдено (${timeUid.substring(0, 8)}...)`;
}

// Форматирование времени из формата HH:mm:ss в HH:mm
function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  // Если время в формате HH:mm:ss, убираем секунды
  if (timeString.includes(':') && timeString.split(':').length === 3) {
    return timeString.substring(0, 5); // Берем только HH:mm
  }
  
  return timeString;
}

// Получение интервала времени для деталей курса
export function getCourseDetailTimeRange(detail: any): string {
  if (!detail.from_time) return 'Время не указано';
  
  // Если from_time и to_time одинаковые (один временной слот)
  if (detail.from_time === detail.to_time) {
    return getTimeSlotTime(detail.from_time);
  }
  
  // Если разные временные слоты
  if (detail.to_time && detail.from_time !== detail.to_time) {
    const fromTime = getTimeSlotTime(detail.from_time);
    const toTime = getTimeSlotTime(detail.to_time);
    
    if (fromTime.includes('не найдено') || toTime.includes('не найдено')) {
      return 'Время не указано';
    }
    
    // Извлекаем только начальное время из первого слота и конечное из второго
    const fromStart = fromTime.split(' - ')[0];
    const toEnd = toTime.split(' - ')[1];
    
    return `${fromStart} - ${toEnd}`;
  }
  
  // Просто один временной слот
  return getTimeSlotTime(detail.from_time);
}
