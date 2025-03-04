import type { Topic } from '../types/Topic';
import api from './api';

export const getTopics = async (): Promise<Topic[]> => {
    const { data } = await api.get<Topic[]>('/topics');
    return data;
};

export const getTopicById = async (id: string): Promise<Topic> => {
    const { data } = await api.get<Topic>(`/topics/${id}`);
    return data;
};

export const createTopic = async (topic: Omit<Topic, '_id'>): Promise<Topic> => {
    const { data } = await api.post<Topic>('/topics', topic);
    return data;
};

export const updateTopicById = async (id: string, topic: Partial<Topic>): Promise<Topic> => {
    const { data } = await api.put<Topic>(`/topics/${id}`, topic);
    return data;
};

export const deleteTopicById = async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`);
};