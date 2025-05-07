import api from './api';
import type { Course } from '../types/Course';
import type { Topic } from '../types/Topic';

// Fetch all courses
export const getCourses = async (): Promise<Course[]> => {
    const { data } = await api.get<Course[]>('/courses');
    return data;
};

// Fetch a single course by ID
export const getCourseById = async (id: string): Promise<Course> => {
  const { data } = await api.get<Course>(`/courses/${id}`);
  return data;
};

// Create a new course
export const createCourseService = async (
  courseData: Partial<Course>, 
  topicsData: Partial<Topic>[] = [] // Default to an empty array if no topics are provided
): Promise<Course> => {
  // console.log('Sending course data:', { courseData, topicsData });
  const { data } = await api.post<Course>('/courses', { courseData, topicsData });
  return data; // Return the created course data
};

// Update a course by ID
export const updateCourseByIdService = async (id: string, courseData: Partial<Course>): Promise<Course> => {
  const { data } = await api.put<Course>(`/courses/${id}`, courseData);
  return data;
};

// Delete a course by ID
export const deleteCourseService = async (id: string): Promise<void> => {
  await api.delete(`/courses/${id}`);
};