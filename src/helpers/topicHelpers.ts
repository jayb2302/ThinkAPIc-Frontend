import { createTopic, updateTopicById } from "../services/topicService";
import type { Course } from "../types/Course";
import type { Topic, TopicInput } from "../types/Topic";
import type { UpdateTopicInput, NewTopicInput } from "../types/Topic";

export const resetMessages = (
  successMessage: { value: string },
  errorMessage: { value: string }
) => {
  successMessage.value = "";
  errorMessage.value = "";
};

export const getSuccessMessage = (isEditing: boolean): string =>
  isEditing ? "Topic updated successfully!" : "Topic added successfully!";

export const handleError = (
  error: any,
  errorMessage: { value: string }
): void => {
  errorMessage.value =
    error?.response?.data?.error || "Something went wrong. Please try again.";
};

export const validateForm = (data: {
  title: string;
  week: number | null;
  summary: string;
  course: Course | null;
}): boolean => {
  return Boolean(
    data.title &&
      data.week !== null &&
      !isNaN(Number(data.week)) &&
      data.summary &&
      data.course
  );
};

export const buildTopicInput = (data: {
  title: string;
  week: number | null;
  summary: string;
  courseId: string;
  keyPoints: string[];
  resources: { title: string; link: string }[];
}): TopicInput => ({
  title: data.title,
  week: data.week ?? 1,
  summary: data.summary,
  course: data.courseId,
  key_points: data.keyPoints,
  resources: data.resources.map((r) => ({ ...r, _id: "" })),
});
export const getCourseId = (course: string | Course): string => {
  return typeof course === "string" ? course : course._id;
};

export const createTopicHelper = async (
  data: NewTopicInput
): Promise<Topic> => {
  return await createTopic(data);
};

export const updateTopicHelper = async (
  id: string,
  data: UpdateTopicInput
): Promise<Topic> => {
  return await updateTopicById(id, data);
};
