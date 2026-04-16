import React from 'react';
import type { ScheduleMeeting } from '../utils/schedule';
import { getScheduleWindow, minutesToTime, SCHEDULE_DAYS } from '../utils/schedule';

interface ScheduleGridProps {
  meetings: ScheduleMeeting[];
}

const MIN_ROW_HEIGHT = 56;

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ meetings }) => {
  const window = getScheduleWindow(meetings);
  const totalMinutes = Math.max(window.end - window.start, 60);
  const hours = Array.from(
    { length: Math.floor(totalMinutes / 60) + 1 },
    (_, index) => window.start + index * 60
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-[72px_repeat(6,minmax(120px,1fr))] border-b border-gray-200 bg-gray-50">
          <div className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Time</div>
          {SCHEDULE_DAYS.map(day => (
            <div key={day.code} className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
              {day.label}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-[72px_repeat(6,minmax(120px,1fr))] relative"
          style={{ height: Math.max((totalMinutes / 60) * MIN_ROW_HEIGHT, 360) }}
        >
          <div className="relative border-r border-gray-200 bg-gray-50">
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 px-3 text-xs text-gray-500"
                style={{ top: `${((hour - window.start) / totalMinutes) * 100}%` }}
              >
                {minutesToTime(hour)}
              </div>
            ))}
          </div>

          {SCHEDULE_DAYS.map(day => (
            <div key={day.code} className="relative border-r border-gray-100 last:border-r-0">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${((hour - window.start) / totalMinutes) * 100}%` }}
                />
              ))}
              {meetings
                .filter(meeting => meeting.dayCode === day.code)
                .map(meeting => {
                  const top = ((meeting.startMinutes - window.start) / totalMinutes) * 100;
                  const height = ((meeting.endMinutes - meeting.startMinutes) / totalMinutes) * 100;

                  return (
                    <div
                      key={meeting.id}
                      className="absolute left-2 right-2 min-h-12 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-950 shadow-sm"
                      style={{
                        top: `${Math.max(top, 0)}%`,
                        height: `${Math.max(height, 9)}%`
                      }}
                    >
                      <div className="font-semibold leading-tight">{meeting.courseCode}</div>
                      <div className="mt-1 text-blue-800">{meeting.startLabel}-{meeting.endLabel}</div>
                      <div className="mt-1 truncate text-blue-700">{meeting.room}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
