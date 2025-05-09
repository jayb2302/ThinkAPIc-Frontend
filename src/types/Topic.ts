import type { Course } from "./Course";

export interface Resource {
  _id: string;
  title: string;
  link: string;
}

export type ResourceInput = Omit<Resource, "_id">;

type BaseTopicFields = {
  title: string;
  week: number;
  summary: string;
  key_points: string[];
  resources: ResourceInput[];
};

export interface Topic extends Omit<BaseTopicFields, "resources"> {
  _id: string;
  resources: Resource[];
  course: Course;
  createdAt: string;
  updatedAt: string;
}

export type TopicInput = BaseTopicFields & {
  course: string;
};

export type NewTopicInput = TopicInput;
export type UpdateTopicInput = TopicInput & { _id: string };
