export interface Course {
  uid: string;
  credit: number;
  discipline: {
    uid: string;
    name: string;
    courseabbreviation: string;
    health_document_required: boolean;
    description: string;
    courseid: number;
  };
  component: {
    uid: string;
    name: string;
    short_name: string;
    serial_number: number;
    code: string;
  };
  study_year: {
    uid: string;
    start: number;
    end: number;
    name: string;
  };
  groups_control_periods: {
    uid: string;
    name: string;
  };
  registration_priority: any[];
  prerequisites: Prerequisite[];
  is_recommended_disciplines: boolean;
  is_connected_with: boolean;
  is_postrequisite: boolean;
  manual_course_access_count: number;
  cycle: {
    uid: string;
    name: string;
    short_name: string;
    serial_number: number;
  };
  language: {
    uid: string;
    name: string;
    code: string | null;
  };
  requestteacherpermission_count: number;
  field_sciences: any[];
  flux: FluxInfo[];
  details?: CourseDetails[]; // Добавляем опциональное поле с деталями
}

export interface Prerequisite {
  uid: string;
  is_active: boolean;
  education_program: any;
  required_discipline: string;
  uuid1c: any;
  required_discipline_ser: {
    uid: string;
    name: string;
    is_practice: boolean;
    health_document_required: boolean;
    courseabbreviation: string;
    courseid: number;
  };
  and_prerequisites: any[];
}

export interface FluxInfo {
  uid: string;
  number_of_times_per_week: number;
  year_of_admission: string;
  period_from: any;
  period_to: any;
  training_format: {
    uid: string;
    name: string;
    code: any;
  };
}

export interface CourseDetails {
  load_type_name: {
    name: string;
  };
  teacher: {
    name_initial: string;
  };
  room: {
    name: string;
  } | null;
  count: number;
  number_of_students: number;
  day_week?: string; // uid дня недели
  from_time?: string; // uid временного слота
  to_time?: string; // uid временного слота
}

export interface FilterOptions {
  searchTerm: string;
  semester: string;
  language: string;
  cycle: string;
  component: string;
  creditRange: [number, number];
  hasPrerequisites: 'all' | 'with' | 'without';
  trainingFormat: string;
  daysOfWeek: string[];    // Массив выбранных кодов дней
  isAvailableOnly: boolean; // Чекбокс "только доступные"
  timeRange: {             // Интервал времени
    from: string;          // 'HH:mm'
    to: string;            // 'HH:mm'
  };
}

// Типы для справочников
export interface DayOfWeek {
  uid: string;
  name: string;
  code: string;
  serial_number: number;
}

export interface TimeSlot {
  uid: string;
  from_time: string; // 'HH:mm:ss'
  to_time: string;   // 'HH:mm:ss'
  name?: string;
}
