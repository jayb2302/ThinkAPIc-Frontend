import api from "./api";

export const getUserProgress = async (userId: string) => {
  const { data } = await api.get(`/progress/${userId}`);
  return data;
};

export const addProgressLog = async (progressData: any) => {
  const { data } = await api.post("/progress", progressData);
  return data;
};
