import axios from 'axios';
import type { Course, CourseDetails, DayOfWeek, TimeSlot } from '../types/course';

// Используем локальный прокси вместо прямого обращения к серверу
const API_BASE_URL = '/api/v1';

// Константы для API
const LOGIN_URL = `${API_BASE_URL}/user/authenticate/`;
const COURSES_LIST_URL = `${API_BASE_URL}/organizations/side_bar_list/`;
const COURSE_INFO_URL_BASE = `${API_BASE_URL}/organizations/info_table/`;
const DAYS_OF_WEEK_URL = `${API_BASE_URL}/organizations/day_of_week/`;
const TIME_SLOTS_URL = `${API_BASE_URL}/organizations/time_slots/`;

// Параметры для запросов (можно сделать конфигурируемыми)
const API_PARAMS = {
  student: 'd033925d-0d96-11ee-a354-005056b702b8',
  place: 'second',
  study_plan: '6b979d86-bd36-409e-80a1-76f45a7146cf',
  status_info: 'cee725fe-0505-40fc-95a1-dd8e195fe9a9',
  rule_for_course: '2201841b-6a6a-43b0-8ce8-56917b947c8c',
  study_year: '2ccb68d9-39dc-11ee-a354-005056b702b8',
  semester: 'a87aaf26-09b1-11ee-8d5e-c0e43437ce6e'
};

export class CourseService {
  private static instance: CourseService;
  private daysOfWeekCache: Map<string, DayOfWeek> = new Map();
  private timeSlotsCache: Map<string, TimeSlot> = new Map();
  
  private axiosInstance = axios.create({
    timeout: 30000,
    withCredentials: true,
    headers: {
      'Accept-Language': 'en',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  private constructor() {
    // Добавляем interceptor для логирования запросов
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Добавляем interceptor для логирования ответов
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`Response ${response.status} from: ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`Error ${error.response?.status} from: ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      console.log('Starting authentication...');
      
      const response = await this.axiosInstance.post(LOGIN_URL, {
        username,
        password,
        recaptcha: ''
      });
      
      console.log('Authentication response status:', response.status);
      
      if (response.status === 200) {
        console.log('Authentication successful! ✅');
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
      }
      
      console.log('Authentication failed - invalid status:', response.status);
      return false;
    } catch (error: any) {
      console.error('Authentication failed:', error.response?.status, error.response?.data || error.message);
      return false;
    }
  }

  async getAllCourses(): Promise<Course[]> {
    const allCourses: Course[] = [];
    let page = 1;
    
    try {
      console.log('Starting to fetch courses...');
      
      while (true) {
        const params = new URLSearchParams({
          ...API_PARAMS,
          page: page.toString()
        });

        console.log(`Fetching page ${page}...`);
        const response = await this.axiosInstance.get(`${COURSES_LIST_URL}?${params}`);
        
        if (response.status !== 200) {
          console.log(`Failed to fetch page ${page}, status: ${response.status}`);
          break;
        }
        
        const data = response.data;
        const results = data.results || [];
        
        console.log(`Page ${page}: found ${results.length} courses`);
        
        if (results.length === 0) break;
        
        allCourses.push(...results);
        
        if (!data.next) {
          console.log('No more pages available');
          break;
        }
        page++;
      }
      
      console.log(`Total courses fetched: ${allCourses.length}`);
      return allCourses;
    } catch (error: any) {
      console.error('Failed to fetch courses:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      
      return [];
    }
  }

  async getCourseDetails(courseUid: string): Promise<CourseDetails[]> {
    try {
      const params = new URLSearchParams({
        ...API_PARAMS,
        place: 'third',
        course: courseUid
      });

      const response = await this.axiosInstance.get(`${COURSE_INFO_URL_BASE}?${params}`);
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch course details:', error.response?.status, error.response?.data || error.message);
      return [];
    }
  }

  async getDaysOfWeek(): Promise<DayOfWeek[]> {
    try {
      if (this.daysOfWeekCache.size > 0) {
        return Array.from(this.daysOfWeekCache.values());
      }

      const response = await this.axiosInstance.get(DAYS_OF_WEEK_URL);
      
      if (response.status === 200 && response.data) {
        const days: DayOfWeek[] = response.data;
        days.forEach(day => this.daysOfWeekCache.set(day.uid, day));
        return days;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch days of week:', error.response?.status, error.response?.data || error.message);
      return [];
    }
  }

  async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      if (this.timeSlotsCache.size > 0) {
        return Array.from(this.timeSlotsCache.values());
      }

      const response = await this.axiosInstance.get(TIME_SLOTS_URL);
      
      if (response.status === 200 && response.data) {
        const timeSlots: TimeSlot[] = response.data;
        timeSlots.forEach(slot => this.timeSlotsCache.set(slot.uid, slot));
        return timeSlots;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch time slots:', error.response?.status, error.response?.data || error.message);
      return [];
    }
  }

  getDayOfWeekByUid(uid: string): DayOfWeek | null {
    return this.daysOfWeekCache.get(uid) || null;
  }

  getTimeSlotByUid(uid: string): TimeSlot | null {
    return this.timeSlotsCache.get(uid) || null;
  }

  async getAllCoursesWithDetails(): Promise<Course[]> {
    console.log('Loading courses with details...');
    
    // Сначала загружаем справочники
    await Promise.all([
      this.getDaysOfWeek(),
      this.getTimeSlots()
    ]);

    // Затем загружаем курсы
    const courses = await this.getAllCourses();
    
    if (courses.length === 0) {
      return courses;
    }

    console.log(`Fetching details for ${courses.length} courses...`);
    
    // Параллельно загружаем детали для всех курсов (ограничиваем до 10 одновременных запросов)
    const batchSize = 10;
    const coursesWithDetails: Course[] = [];

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (course) => {
          try {
            const details = await this.getCourseDetails(course.uid);
            return { ...course, details };
          } catch (error) {
            console.error(`Failed to load details for course ${course.uid}:`, error);
            return { ...course, details: [] };
          }
        })
      );
      coursesWithDetails.push(...batchResults);
      console.log(`Processed ${Math.min(i + batchSize, courses.length)}/${courses.length} courses`);
    }

    console.log('All course details loaded successfully');
    return coursesWithDetails;
  }
}

export const courseService = CourseService.getInstance();
