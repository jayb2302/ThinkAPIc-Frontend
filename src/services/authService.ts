import api from "./api";

export const login = (email: string, password: string) => {
  return api.post("/auth/login", { email, password });
};

export const register = async (
  username: string,
  email: string,
  password: string,
  role: string = "student"
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
    role,
  });
  return response.data; // Ensure this is returning the user object
};

export const getCurrentUser = async () => {
  return api.get("/auth/me");
};
