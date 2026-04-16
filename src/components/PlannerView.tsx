import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, GripVertical, MoveHorizontal, Trash2 } from 'lucide-react';
import type { Course } from '../types/course';
import { buildSchedulePlans, getCourseMeetings, SCHEDULE_DAYS } from '../utils/schedule';
import type { ManualScheduleSlot } from '../utils/schedule';
import { getCourseAvailability } from '../utils/courseStatus';
import { ScheduleGrid } from './ScheduleGrid';

interface PlannerViewProps {
  courses: Course[];
  selectedSubjectUids: string[];
  pinnedCourseBySubject: Record<string, string>;
  manualSlotsBySubject: Record<string, ManualScheduleSlot>;
  onRemoveSubject: (subjectUid: string) => void;
  onPinCourse: (subjectUid: string, courseUid: string) => void;
  onSetManualSlot: (subjectUid: string, slot: ManualScheduleSlot | null) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  courses,
  selectedSubjectUids,
  pinnedCourseBySubject,
  manualSlotsBySubject,
  onRemoveSubject,
  onPinCourse,
  onSetManualSlot
}) => {
  const subjectGroups = useMemo(() => {
    return selectedSubjectUids.map(subjectUid => {
      const options = courses.filter(course => course.discipline.uid === subjectUid);
      return {
        subjectUid,
        title: options[0]?.discipline.name || 'Unknown course',
        code: options[0]?.discipline.courseabbreviation || 'No code',
        options
      };
    }).filter(group => group.options.length > 0);
  }, [courses, selectedSubjectUids]);

  const plans = useMemo(() => (
    buildSchedulePlans(selectedSubjectUids, courses, pinnedCourseBySubject, manualSlotsBySubject)
  ), [courses, manualSlotsBySubject, pinnedCourseBySubject, selectedSubjectUids]);

  const selectedPlan = plans[0];

  if (selectedSubjectUids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">План пока пустой</h2>
        <p className="mt-2 text-gray-600">
          В каталоге нажми “В план” на нужных предметах. Здесь появятся варианты секций и расписание без лишних запросов к AUCA Study.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Planner basket</h2>
            <p className="mt-1 text-sm text-gray-600">
              Выбери секцию из AUCA API или включи manual slot, если API не дал время. Изменение дня/времени сразу двигает блок на сетке.
            </p>
          </div>

          <div className="space-y-3">
            {subjectGroups.map(group => (
              <div key={group.subjectUid} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                {(() => {
                  const manualSlot = manualSlotsBySubject[group.subjectUid] || {
                    enabled: false,
                    dayCode: 'monday',
                    startTime: '09:00',
                    endTime: '10:15'
                  };
                  const hasApiSchedule = group.options.some(course => getCourseMeetings(course).length > 0);

                  return (
                    <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{group.title}</div>
                    <div className="mt-1 text-xs font-medium text-blue-700">{group.code}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSubject(group.subjectUid)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Убрать из плана"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Section option
                  </label>
                  <select
                    value={pinnedCourseBySubject[group.subjectUid] || ''}
                    onChange={(event) => onPinCourse(group.subjectUid, event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto pick best non-conflict option</option>
                    {group.options.map(course => {
                      const status = getCourseAvailability(course);
                      const meetings = getCourseMeetings(course);
                      const timeLabel = meetings.length > 0
                        ? meetings.map(item => `${item.dayName} ${item.startLabel}`).join(', ')
                        : 'No schedule';

                      return (
                        <option key={course.uid} value={course.uid}>
                          {course.discipline.courseabbreviation} | {timeLabel} | {status.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {!hasApiSchedule && !manualSlot.enabled && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    У этого предмета нет времени в данных API. Включи manual slot ниже, чтобы поставить его на расписание вручную.
                  </div>
                )}

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <label className="flex items-center justify-between gap-3 text-sm font-medium text-gray-800">
                    <span className="inline-flex items-center gap-2">
                      <MoveHorizontal className="h-4 w-4 text-gray-500" />
                      Manual slot
                    </span>
                    <input
                      type="checkbox"
                      checked={manualSlot.enabled}
                      onChange={(event) => onSetManualSlot(group.subjectUid, {
                        ...manualSlot,
                        enabled: event.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {manualSlot.enabled && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <select
                        value={manualSlot.dayCode}
                        onChange={(event) => onSetManualSlot(group.subjectUid, {
                          ...manualSlot,
                          dayCode: event.target.value
                        })}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        {SCHEDULE_DAYS.map(day => (
                          <option key={day.code} value={day.code}>{day.label}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={manualSlot.startTime}
                        onChange={(event) => onSetManualSlot(group.subjectUid, {
                          ...manualSlot,
                          startTime: event.target.value
                        })}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                      <input
                        type="time"
                        value={manualSlot.endTime}
                        onChange={(event) => onSetManualSlot(group.subjectUid, {
                          ...manualSlot,
                          endTime: event.target.value
                        })}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Smart schedule builder</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Лучший вариант выбирается по отсутствию конфликтов и свободным местам. Чтобы “передвинуть” курс, поменяй manual day/time слева.
                </p>
              </div>
              {selectedPlan && (
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
                  selectedPlan.conflicts.length === 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {selectedPlan.conflicts.length === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {selectedPlan.conflicts.length === 0 ? 'No conflicts' : `${selectedPlan.conflicts.length} conflicts`}
                </div>
              )}
            </div>

            <div className="mt-5">
              {selectedPlan ? (
                selectedPlan.meetings.length > 0 ? (
                  <ScheduleGrid meetings={selectedPlan.meetings} />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    В корзине есть предметы, но у них нет расписания в API. Включи manual slot у нужного предмета слева.
                  </div>
                )
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  Недостаточно данных расписания для построения сетки.
                </div>
              )}
            </div>
          </div>

          {selectedPlan && selectedPlan.conflicts.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-semibold">Конфликты времени</div>
              <div className="mt-2 space-y-1">
                {selectedPlan.conflicts.map((conflict, index) => (
                  <div key={`${conflict.first.id}-${conflict.second.id}-${index}`}>
                    {conflict.first.courseCode} пересекается с {conflict.second.courseCode} в {conflict.first.dayName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {plans.length > 1 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Backup plans</h3>
              <div className="mt-3 space-y-2">
                {plans.slice(1, 5).map((plan, index) => (
                  <div key={index} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      Plan {index + 2}: {plan.courses.map(course => course.discipline.courseabbreviation).join(', ')}
                    </div>
                    <span className={plan.conflicts.length === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                      {plan.conflicts.length === 0 ? 'clean' : `${plan.conflicts.length} conflicts`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
