import api from './api';
import type { Course } from '../types/Course';

export const getCourses = async (): Promise<Course[]> => {
    const { data } = await api.get<Course[]>('/courses');
    return data;
};