import type { Course } from './Course'; 

export interface Resource {
  _id: string;
  title: string;
  link: string;
}

export interface Topic {
  _id: string;
  title: string;
  week: number;
  summary: string;
  key_points: string[];
  resources: Resource[];
  course: Course; 
  createdAt: string;
  updatedAt: string;
}

export type TopicInput = {
  title: string;
  week: number;
  summary: string;
  course: string; 
  key_points: string[];
  resources: Array<Omit<Resource, "_id">>;
};