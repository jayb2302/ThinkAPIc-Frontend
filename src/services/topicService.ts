import type { Topic } from '../types/Topic';
import api from './api';


export const getTopics = async (): Promise<Topic[]> => {
    const { data } = await api.get<Topic[]>('/topics');
    return data;
};