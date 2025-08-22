import type { Course } from '../types/course';

export const mockCourses: Course[] = [
  {
    uid: '2549b48f-015a-42bd-b292-175d806f88f7',
    credit: 6.0,
    discipline: {
      uid: '6349cff6-0cd8-11ee-a354-005056b702b8',
      name: 'Теория и методы анализа данных',
      courseabbreviation: 'COM/MATH-295',
      health_document_required: false,
      description: '',
      courseid: 4520
    },
    component: {
      uid: '6135a63e-09a3-11ee-8d5e-c0e43437ce6e',
      name: 'Вариативная часть',
      short_name: 'ВЧ',
      serial_number: 2,
      code: 'variable_part'
    },
    study_year: {
      uid: '2ccb68d9-39dc-11ee-a354-005056b702b8',
      start: 2025,
      end: 2026,
      name: '2025-2026'
    },
    groups_control_periods: {
      uid: 'a87aaf26-09b1-11ee-8d5e-c0e43437ce6e',
      name: 'Осень'
    },
    registration_priority: [],
    prerequisites: [
      {
        uid: '383e3232-2ef8-494d-8f26-20b50de6f1ec',
        is_active: true,
        education_program: null,
        required_discipline: '38f33f2e-0cd8-11ee-a354-005056b702b8',
        uuid1c: null,
        required_discipline_ser: {
          uid: '38f33f2e-0cd8-11ee-a354-005056b702b8',
          name: 'Математический анализ I',
          is_practice: false,
          health_document_required: false,
          courseabbreviation: 'MAT-233.2',
          courseid: 3855
        },
        and_prerequisites: []
      },
      {
        uid: '944bfa1d-7f7d-4bd1-b627-067986848745',
        is_active: true,
        education_program: null,
        required_discipline: '5b23a554-0cd8-11ee-a354-005056b702b8',
        uuid1c: null,
        required_discipline_ser: {
          uid: '5b23a554-0cd8-11ee-a354-005056b702b8',
          name: 'Объектно-ориентированное программирование',
          is_practice: false,
          health_document_required: false,
          courseabbreviation: 'COM - 119',
          courseid: 4357
        },
        and_prerequisites: []
      }
    ],
    is_recommended_disciplines: true,
    is_connected_with: false,
    is_postrequisite: true,
    manual_course_access_count: 0,
    cycle: {
      uid: '6135a63c-09a3-11ee-8d5e-c0e43437ce6e',
      name: 'Major Requirements',
      short_name: '',
      serial_number: 3
    },
    language: {
      uid: '17c5d750-0cd7-11ee-a354-005056b702b8',
      name: 'English',
      code: null
    },
    requestteacherpermission_count: 0,
    field_sciences: [],
    flux: [
      {
        uid: '429000b0-d688-444c-90bb-9bc7c1b08255',
        number_of_times_per_week: 1,
        year_of_admission: '',
        period_from: null,
        period_to: null,
        training_format: {
          uid: '4a9f786c-09b2-11ee-8d5e-c0e43437ce6e',
          name: 'On-campus',
          code: null
        }
      }
    ],
    details: [
      {
        load_type_name: {
          name: 'Лекция'
        },
        teacher: {
          name_initial: 'Иванов И.И.'
        },
        room: {
          name: 'Ауд. 301'
        },
        count: 20,
        number_of_students: 25,
        day_week: 'monday',
        from_time: '09:00',
        to_time: '10:30'
      },
      {
        load_type_name: {
          name: 'Семинар'
        },
        teacher: {
          name_initial: 'Петров П.П.'
        },
        room: {
          name: 'Ауд. 205'
        },
        count: 15,
        number_of_students: 25,
        day_week: 'wednesday',
        from_time: '14:00',
        to_time: '15:30'
      }
    ]
  },
  {
    uid: '1234b48f-015a-42bd-b292-175d806f88f8',
    credit: 3.0,
    discipline: {
      uid: '5678cff6-0cd8-11ee-a354-005056b702b9',
      name: 'Introduction to Computer Science',
      courseabbreviation: 'COM-101',
      health_document_required: false,
      description: 'Basic concepts of computer science',
      courseid: 1001
    },
    component: {
      uid: '1111a63e-09a3-11ee-8d5e-c0e43437ce6f',
      name: 'Обязательная часть',
      short_name: 'ОЧ',
      serial_number: 1,
      code: 'required_part'
    },
    study_year: {
      uid: '2ccb68d9-39dc-11ee-a354-005056b702b8',
      start: 2025,
      end: 2026,
      name: '2025-2026'
    },
    groups_control_periods: {
      uid: 'b87aaf26-09b1-11ee-8d5e-c0e43437ce6f',
      name: 'Весна'
    },
    registration_priority: [],
    prerequisites: [],
    is_recommended_disciplines: false,
    is_connected_with: false,
    is_postrequisite: false,
    manual_course_access_count: 0,
    cycle: {
      uid: '1111a63c-09a3-11ee-8d5e-c0e43437ce6f',
      name: 'General Education',
      short_name: 'GE',
      serial_number: 1
    },
    language: {
      uid: '22c5d750-0cd7-11ee-a354-005056b702b9',
      name: 'English',
      code: null
    },
    requestteacherpermission_count: 0,
    field_sciences: [],
    flux: [
      {
        uid: '555000b0-d688-444c-90bb-9bc7c1b08256',
        number_of_times_per_week: 2,
        year_of_admission: '',
        period_from: null,
        period_to: null,
        training_format: {
          uid: '4a9f786c-09b2-11ee-8d5e-c0e43437ce6e',
          name: 'On-campus',
          code: null
        }
      }
    ],
    details: [
      {
        load_type_name: {
          name: 'Лекция'
        },
        teacher: {
          name_initial: 'Смит Д.'
        },
        room: {
          name: 'Ауд. 101'
        },
        count: 30,
        number_of_students: 35,
        day_week: 'tuesday',
        from_time: '10:00',
        to_time: '11:30'
      },
      {
        load_type_name: {
          name: 'Лаборатория'
        },
        teacher: {
          name_initial: 'Браун М.'
        },
        room: {
          name: 'Лаб. 12'
        },
        count: 18,
        number_of_students: 35,
        day_week: 'thursday',
        from_time: '15:00',
        to_time: '16:30'
      }
    ]
  },
  {
    uid: '3333b48f-015a-42bd-b292-175d806f88f9',
    credit: 4.0,
    discipline: {
      uid: '7777cff6-0cd8-11ee-a354-005056b702c0',
      name: 'Математический анализ II',
      courseabbreviation: 'MAT-234',
      health_document_required: false,
      description: 'Продвинутые темы математического анализа',
      courseid: 2001
    },
    component: {
      uid: '2222a63e-09a3-11ee-8d5e-c0e43437ce70',
      name: 'Обязательная часть',
      short_name: 'ОЧ',
      serial_number: 1,
      code: 'required_part'
    },
    study_year: {
      uid: '2ccb68d9-39dc-11ee-a354-005056b702b8',
      start: 2025,
      end: 2026,
      name: '2025-2026'
    },
    groups_control_periods: {
      uid: 'a87aaf26-09b1-11ee-8d5e-c0e43437ce6e',
      name: 'Осень'
    },
    registration_priority: [],
    prerequisites: [
      {
        uid: '111e3232-2ef8-494d-8f26-20b50de6f1e4',
        is_active: true,
        education_program: null,
        required_discipline: '38f33f2e-0cd8-11ee-a354-005056b702b8',
        uuid1c: null,
        required_discipline_ser: {
          uid: '38f33f2e-0cd8-11ee-a354-005056b702b8',
          name: 'Математический анализ I',
          is_practice: false,
          health_document_required: false,
          courseabbreviation: 'MAT-233',
          courseid: 1855
        },
        and_prerequisites: []
      }
    ],
    is_recommended_disciplines: true,
    is_connected_with: false,
    is_postrequisite: true,
    manual_course_access_count: 0,
    cycle: {
      uid: '3333a63c-09a3-11ee-8d5e-c0e43437ce71',
      name: 'Major Requirements',
      short_name: '',
      serial_number: 3
    },
    language: {
      uid: '33c5d750-0cd7-11ee-a354-005056b702c1',
      name: 'Russian',
      code: null
    },
    requestteacherpermission_count: 0,
    field_sciences: [],
    flux: [
      {
        uid: '777000b0-d688-444c-90bb-9bc7c1b08257',
        number_of_times_per_week: 3,
        year_of_admission: '',
        period_from: null,
        period_to: null,
        training_format: {
          uid: '4a9f786c-09b2-11ee-8d5e-c0e43437ce6e',
          name: 'On-campus',
          code: null
        }
      }
    ],
    details: [
      {
        load_type_name: {
          name: 'Лекция'
        },
        teacher: {
          name_initial: 'Волков А.С.'
        },
        room: {
          name: 'Ауд. 401'
        },
        count: 25,
        number_of_students: 28,
        day_week: 'monday',
        from_time: '11:00',
        to_time: '12:30'
      },
      {
        load_type_name: {
          name: 'Практика'
        },
        teacher: {
          name_initial: 'Волков А.С.'
        },
        room: {
          name: 'Ауд. 402'
        },
        count: 20,
        number_of_students: 28,
        day_week: 'friday',
        from_time: '09:00',
        to_time: '10:30'
      }
    ]
  },
  {
    uid: '4444b48f-015a-42bd-b292-175d806f8800',
    credit: 2.0,
    discipline: {
      uid: '8888cff6-0cd8-11ee-a354-005056b702c2',
      name: 'Physical Education',
      courseabbreviation: 'PE-101',
      health_document_required: true,
      description: 'Physical fitness and health',
      courseid: 3001
    },
    component: {
      uid: '4444a63e-09a3-11ee-8d5e-c0e43437ce72',
      name: 'Дополнительная часть',
      short_name: 'ДЧ',
      serial_number: 4,
      code: 'additional_part'
    },
    study_year: {
      uid: '2ccb68d9-39dc-11ee-a354-005056b702b8',
      start: 2025,
      end: 2026,
      name: '2025-2026'
    },
    groups_control_periods: {
      uid: 'b87aaf26-09b1-11ee-8d5e-c0e43437ce6f',
      name: 'Весна'
    },
    registration_priority: [],
    prerequisites: [],
    is_recommended_disciplines: false,
    is_connected_with: false,
    is_postrequisite: false,
    manual_course_access_count: 0,
    cycle: {
      uid: '4444a63c-09a3-11ee-8d5e-c0e43437ce73',
      name: 'General Education',
      short_name: 'GE',
      serial_number: 1
    },
    language: {
      uid: '44c5d750-0cd7-11ee-a354-005056b702c3',
      name: 'English',
      code: null
    },
    requestteacherpermission_count: 0,
    field_sciences: [],
    flux: [
      {
        uid: '888000b0-d688-444c-90bb-9bc7c1b08258',
        number_of_times_per_week: 2,
        year_of_admission: '',
        period_from: null,
        period_to: null,
        training_format: {
          uid: '5555786c-09b2-11ee-8d5e-c0e43437ce74',
          name: 'Hybrid',
          code: null
        }
      }
    ],
    details: [
      {
        load_type_name: {
          name: 'Практика'
        },
        teacher: {
          name_initial: 'Не назначен'
        },
        room: {
          name: 'Спортзал'
        },
        count: 0,
        number_of_students: 20,
        day_week: 'tuesday',
        from_time: '16:00',
        to_time: '17:30'
      },
      {
        load_type_name: {
          name: 'Практика'
        },
        teacher: {
          name_initial: 'Не назначен'
        },
        room: {
          name: 'Стадион'
        },
        count: 0,
        number_of_students: 20,
        day_week: 'thursday',
        from_time: '16:00',
        to_time: '17:30'
      }
    ]
  },
  {
    uid: '5555b48f-015a-42bd-b292-175d806f8801',
    credit: 5.0,
    discipline: {
      uid: '9999cff6-0cd8-11ee-a354-005056b702c4',
      name: 'Database Systems',
      courseabbreviation: 'COM-220',
      health_document_required: false,
      description: 'Design and implementation of database systems',
      courseid: 4001
    },
    component: {
      uid: '5555a63e-09a3-11ee-8d5e-c0e43437ce74',
      name: 'Вариативная часть',
      short_name: 'ВЧ',
      serial_number: 2,
      code: 'variable_part'
    },
    study_year: {
      uid: '2ccb68d9-39dc-11ee-a354-005056b702b8',
      start: 2025,
      end: 2026,
      name: '2025-2026'
    },
    groups_control_periods: {
      uid: 'a87aaf26-09b1-11ee-8d5e-c0e43437ce6e',
      name: 'Осень'
    },
    registration_priority: [],
    prerequisites: [
      {
        uid: '222e3232-2ef8-494d-8f26-20b50de6f1e5',
        is_active: true,
        education_program: null,
        required_discipline: '5678cff6-0cd8-11ee-a354-005056b702b9',
        uuid1c: null,
        required_discipline_ser: {
          uid: '5678cff6-0cd8-11ee-a354-005056b702b9',
          name: 'Introduction to Computer Science',
          is_practice: false,
          health_document_required: false,
          courseabbreviation: 'COM-101',
          courseid: 1001
        },
        and_prerequisites: []
      }
    ],
    is_recommended_disciplines: true,
    is_connected_with: true,
    is_postrequisite: true,
    manual_course_access_count: 2,
    cycle: {
      uid: '5555a63c-09a3-11ee-8d5e-c0e43437ce75',
      name: 'Major Requirements',
      short_name: '',
      serial_number: 3
    },
    language: {
      uid: '55c5d750-0cd7-11ee-a354-005056b702c5',
      name: 'English',
      code: null
    },
    requestteacherpermission_count: 1,
    field_sciences: [],
    flux: [
      {
        uid: '999000b0-d688-444c-90bb-9bc7c1b08259',
        number_of_times_per_week: 3,
        year_of_admission: '',
        period_from: null,
        period_to: null,
        training_format: {
          uid: '4a9f786c-09b2-11ee-8d5e-c0e43437ce6e',
          name: 'On-campus',
          code: null
        }
      }
    ],
    details: [
      {
        load_type_name: {
          name: 'Лекция'
        },
        teacher: {
          name_initial: 'Джонсон Р.'
        },
        room: {
          name: 'Ауд. 203'
        },
        count: 22,
        number_of_students: 25,
        day_week: 'wednesday',
        from_time: '10:00',
        to_time: '11:30'
      },
      {
        load_type_name: {
          name: 'Лаборатория'
        },
        teacher: {
          name_initial: 'Тейлор К.'
        },
        room: {
          name: 'Лаб. 5'
        },
        count: 15,
        number_of_students: 25,
        day_week: 'friday',
        from_time: '14:00',
        to_time: '17:00'
      }
    ]
  }
];

export const mockDaysOfWeek = [
  { uid: 'monday-uid', name: 'Понедельник', code: 'monday', serial_number: 1 },
  { uid: 'tuesday-uid', name: 'Вторник', code: 'tuesday', serial_number: 2 },
  { uid: 'wednesday-uid', name: 'Среда', code: 'wednesday', serial_number: 3 },
  { uid: 'thursday-uid', name: 'Четверг', code: 'thursday', serial_number: 4 },
  { uid: 'friday-uid', name: 'Пятница', code: 'friday', serial_number: 5 },
  { uid: 'saturday-uid', name: 'Суббота', code: 'saturday', serial_number: 6 },
  { uid: 'sunday-uid', name: 'Воскресенье', code: 'sunday', serial_number: 7 }
];

export const mockTimeSlots = [
  { uid: 'slot-1', from_time: '08:00:00', to_time: '09:30:00', name: '1-я пара' },
  { uid: 'slot-2', from_time: '09:45:00', to_time: '11:15:00', name: '2-я пара' },
  { uid: 'slot-3', from_time: '11:30:00', to_time: '13:00:00', name: '3-я пара' },
  { uid: 'slot-4', from_time: '14:00:00', to_time: '15:30:00', name: '4-я пара' },
  { uid: 'slot-5', from_time: '15:45:00', to_time: '17:15:00', name: '5-я пара' },
  { uid: 'slot-6', from_time: '17:30:00', to_time: '19:00:00', name: '6-я пара' }
];

export const mockCourseDetails = [
  {
    load_type_name: {
      name: 'Lecture'
    },
    teacher: {
      name_initial: 'Dr. Johnson A.'
    },
    room: {
      name: 'Room 201'
    },
    count: 25,
    number_of_students: 30
  },
  {
    load_type_name: {
      name: 'Seminar'
    },
    teacher: {
      name_initial: 'Prof. Smith B.'
    },
    room: {
      name: 'Room 105'
    },
    count: 15,
    number_of_students: 20
  }
];
