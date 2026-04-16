import React from 'react';
import { Target } from 'lucide-react';
import type { Course, CoursePriority } from '../types/course';
import { getCourseAvailability } from '../utils/courseStatus';

interface WishlistBoardProps {
  courses: Course[];
  priorities: Record<string, CoursePriority>;
  onSetPriority: (courseUid: string, priority: CoursePriority | null) => void;
  onAddToPlanner: (course: Course) => void;
}

const COLUMNS: Array<{ key: CoursePriority; title: string; hint: string }> = [
  { key: 'must', title: 'Must take', hint: 'Главные цели регистрации' },
  { key: 'nice', title: 'Nice to have', hint: 'Хорошо бы взять' },
  { key: 'backup', title: 'Backup', hint: 'Запасные варианты' },
  { key: 'avoid', title: 'Avoid', hint: 'Лучше не брать' }
];

export const WishlistBoard: React.FC<WishlistBoardProps> = ({
  courses,
  priorities,
  onSetPriority,
  onAddToPlanner
}) => {
  const byUid = new Map(courses.map(course => [course.uid, course]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Wishlist board</h2>
        <p className="mt-1 text-sm text-gray-600">
          Быстрая доска приоритетов. Это локальные заметки в браузере, они не отправляются в AUCA Study.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {COLUMNS.map(column => {
          const columnCourses = Object.entries(priorities)
            .filter(([, priority]) => priority === column.key)
            .map(([uid]) => byUid.get(uid))
            .filter(Boolean) as Course[];

          return (
            <div key={column.key} className="min-h-72 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{column.hint}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  {columnCourses.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {columnCourses.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                    Пусто
                  </div>
                )}

                {columnCourses.map(course => {
                  const status = getCourseAvailability(course);

                  return (
                    <div key={course.uid} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="text-sm font-semibold text-gray-900">{course.discipline.name}</div>
                      <div className="mt-1 text-xs font-medium text-blue-700">{course.discipline.courseabbreviation}</div>
                      <div className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${status.tone}`}>
                        {status.label}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onAddToPlanner(course)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Target className="h-3.5 w-3.5" />
                          В план
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetPriority(course.uid, null)}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-white hover:text-rose-600"
                        >
                          убрать
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
