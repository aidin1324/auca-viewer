import type { Course } from '../types/course';
import { courseService } from '../services/courseService';
import { formatTeacherName } from './courseDisplay';
import { getCourseAvailability } from './courseStatus';

export interface ScheduleMeeting {
  id: string;
  courseUid: string;
  courseName: string;
  courseCode: string;
  dayCode: string;
  dayName: string;
  dayOrder: number;
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
  teacher: string;
  room: string;
  loadType: string;
}

export interface ScheduleConflict {
  first: ScheduleMeeting;
  second: ScheduleMeeting;
}

export interface SchedulePlan {
  courses: Course[];
  meetings: ScheduleMeeting[];
  conflicts: ScheduleConflict[];
  score: number;
  freeSeats: number;
}

export interface ManualScheduleSlot {
  enabled: boolean;
  dayCode: string;
  startTime: string;
  endTime: string;
}

const FALLBACK_DAYS = [
  { code: 'monday', label: 'Monday', order: 1 },
  { code: 'tuesday', label: 'Tuesday', order: 2 },
  { code: 'wednesday', label: 'Wednesday', order: 3 },
  { code: 'thursday', label: 'Thursday', order: 4 },
  { code: 'friday', label: 'Friday', order: 5 },
  { code: 'saturday', label: 'Saturday', order: 6 },
  { code: 'sunday', label: 'Sunday', order: 7 }
];

export const SCHEDULE_DAYS = FALLBACK_DAYS.slice(0, 6);

function normalizeTime(value: string) {
  if (!value) return '00:00';
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = normalizeTime(value).split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function getCourseMeetings(course: Course): ScheduleMeeting[] {
  return (course.details || []).flatMap((detail, index) => {
    if (!detail.day_week || !detail.from_time) return [];

    const day = courseService.getDayOfWeekByUid(detail.day_week);
    const fromSlot = courseService.getTimeSlotByUid(detail.from_time);
    const toSlot = courseService.getTimeSlotByUid(detail.to_time || detail.from_time);

    if (!day || !fromSlot) return [];

    const fallbackDay = FALLBACK_DAYS.find(item => item.code === day.code.toLowerCase());
    const startLabel = normalizeTime(fromSlot.from_time);
    const endLabel = normalizeTime((toSlot || fromSlot).to_time);

    return [{
      id: `${course.uid}-${index}`,
      courseUid: course.uid,
      courseName: course.discipline.name,
      courseCode: course.discipline.courseabbreviation,
      dayCode: day.code.toLowerCase(),
      dayName: day.name,
      dayOrder: day.serial_number || fallbackDay?.order || 99,
      startMinutes: timeToMinutes(startLabel),
      endMinutes: timeToMinutes(endLabel),
      startLabel,
      endLabel,
      teacher: formatTeacherName(detail.teacher),
      room: detail.room?.name || 'Room TBA',
      loadType: detail.load_type_name?.name || 'Class'
    }];
  }).sort((a, b) => a.dayOrder - b.dayOrder || a.startMinutes - b.startMinutes);
}

function getManualMeeting(course: Course, slot?: ManualScheduleSlot): ScheduleMeeting[] {
  if (!slot?.enabled) return [];

  const day = SCHEDULE_DAYS.find(item => item.code === slot.dayCode) || SCHEDULE_DAYS[0];
  const startMinutes = timeToMinutes(slot.startTime);
  const endMinutes = Math.max(timeToMinutes(slot.endTime), startMinutes + 30);

  return [{
    id: `${course.uid}-manual-${slot.dayCode}`,
    courseUid: course.uid,
    courseName: course.discipline.name,
    courseCode: course.discipline.courseabbreviation,
    dayCode: day.code,
    dayName: day.label,
    dayOrder: day.order,
    startMinutes,
    endMinutes,
    startLabel: minutesToTime(startMinutes),
    endLabel: minutesToTime(endMinutes),
    teacher: 'Manual slot',
    room: 'Manual',
    loadType: 'Manual plan'
  }];
}

export function getPlannedCourseMeetings(course: Course, manualSlot?: ManualScheduleSlot): ScheduleMeeting[] {
  const manualMeeting = getManualMeeting(course, manualSlot);
  if (manualMeeting.length > 0) return manualMeeting;

  return getCourseMeetings(course);
}

export function findScheduleConflicts(meetings: ScheduleMeeting[]) {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < meetings.length; i++) {
    for (let j = i + 1; j < meetings.length; j++) {
      const first = meetings[i];
      const second = meetings[j];

      if (first.courseUid === second.courseUid || first.dayCode !== second.dayCode) continue;

      const overlaps = first.startMinutes < second.endMinutes && second.startMinutes < first.endMinutes;
      if (overlaps) conflicts.push({ first, second });
    }
  }

  return conflicts;
}

export function getScheduleWindow(meetings: ScheduleMeeting[]) {
  if (meetings.length === 0) return { start: 8 * 60, end: 18 * 60 };

  const start = Math.min(...meetings.map(item => item.startMinutes), 8 * 60);
  const end = Math.max(...meetings.map(item => item.endMinutes), 18 * 60);

  return {
    start: Math.max(7 * 60, Math.floor(start / 60) * 60),
    end: Math.min(22 * 60, Math.ceil(end / 60) * 60)
  };
}

export function buildSchedulePlans(
  subjectUids: string[],
  courses: Course[],
  pinnedCourseBySubject: Record<string, string>,
  manualSlotsBySubject: Record<string, ManualScheduleSlot> = {}
): SchedulePlan[] {
  const groups = subjectUids.map(subjectUid => {
    const subjectCourses = courses
      .filter(course => course.discipline.uid === subjectUid)
      .sort((a, b) => {
        const statusA = getCourseAvailability(a);
        const statusB = getCourseAvailability(b);
        const seatsA = statusA.freeSeats ?? -1;
        const seatsB = statusB.freeSeats ?? -1;
        return seatsB - seatsA || a.discipline.courseabbreviation.localeCompare(b.discipline.courseabbreviation);
      });

    const pinnedCourse = pinnedCourseBySubject[subjectUid];
    const options = pinnedCourse
      ? subjectCourses.filter(course => course.uid === pinnedCourse)
      : subjectCourses.slice(0, 6);

    return options.length > 0 ? options : subjectCourses.slice(0, 1);
  }).filter(group => group.length > 0);

  if (groups.length === 0) return [];

  const plans: SchedulePlan[] = [];
  const maxPlans = 80;

  const visit = (groupIndex: number, selectedCourses: Course[]) => {
    if (plans.length >= maxPlans) return;

    if (groupIndex >= groups.length) {
      const meetings = selectedCourses.flatMap(course => (
        getPlannedCourseMeetings(course, manualSlotsBySubject[course.discipline.uid])
      ));
      const conflicts = findScheduleConflicts(meetings);
      const freeSeats = selectedCourses.reduce((sum, course) => {
        const status = getCourseAvailability(course);
        return sum + (status.freeSeats ?? 0);
      }, 0);

      plans.push({
        courses: selectedCourses,
        meetings,
        conflicts,
        freeSeats,
        score: freeSeats - conflicts.length * 100
      });
      return;
    }

    groups[groupIndex].forEach(course => visit(groupIndex + 1, [...selectedCourses, course]));
  };

  visit(0, []);

  return plans
    .sort((a, b) => b.score - a.score || a.conflicts.length - b.conflicts.length)
    .slice(0, 8);
}
