import type { Course, CourseDetails } from '../types/course';

export type AvailabilityState = 'open' | 'full' | 'permission' | 'unknown';

export interface AvailabilitySummary {
  state: AvailabilityState;
  label: string;
  tone: string;
  occupied: number;
  capacity: number;
  freeSeats: number | null;
}

const countKnownSeats = (details: CourseDetails[]) => {
  return details.reduce(
    (summary, detail) => {
      if (detail.number_of_students > 0) {
        summary.capacity += detail.number_of_students;
        summary.occupied += Math.max(detail.count, 0);
      }
      return summary;
    },
    { occupied: 0, capacity: 0 }
  );
};

export function getCourseAvailability(course: Course): AvailabilitySummary {
  const details = course.details || [];
  const { occupied, capacity } = countKnownSeats(details);
  const freeSeats = capacity > 0 ? Math.max(capacity - occupied, 0) : null;

  if (course.requestteacherpermission_count > 0 || course.manual_course_access_count > 0) {
    return {
      state: 'permission',
      label: freeSeats === null ? 'Нужна проверка' : `${freeSeats} мест, есть ограничения`,
      tone: 'bg-amber-50 text-amber-800 border-amber-200',
      occupied,
      capacity,
      freeSeats
    };
  }

  if (capacity === 0) {
    return {
      state: 'unknown',
      label: 'Статус неизвестен',
      tone: 'bg-slate-50 text-slate-700 border-slate-200',
      occupied,
      capacity,
      freeSeats
    };
  }

  if (freeSeats && freeSeats > 0) {
    return {
      state: 'open',
      label: `${freeSeats} мест свободно`,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      occupied,
      capacity,
      freeSeats
    };
  }

  return {
    state: 'full',
    label: 'Мест нет',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    occupied,
    capacity,
    freeSeats
  };
}

export function describeStatusReason(course: Course) {
  const summary = getCourseAvailability(course);

  if (summary.state === 'permission') {
    return 'Места могут быть, но курс отмечен как требующий ручного доступа или teacher permission.';
  }

  if (summary.state === 'unknown') {
    return 'API не дал вместимость секций, поэтому приложение не делает вывод о доступности.';
  }

  if (summary.state === 'open') {
    return `По деталям секций видно ${summary.freeSeats} свободных мест. Финальную регистрацию делай вручную в AUCA Study.`;
  }

  return 'По деталям секций все указанные места заняты.';
}
