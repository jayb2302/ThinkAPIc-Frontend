import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login, register, getCurrentUser } from "../services/authService";
import type { User } from "../types/User";

export type AuthStore = ReturnType<typeof useAuthStore>;

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string>(localStorage.getItem("token") || "");
  const role = ref<string>(localStorage.getItem("role") || "");
  const username = ref<string>(localStorage.getItem("username") || "");

  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const isAdmin = computed(() => role.value === "admin");
  const getUser = computed(() => user.value);

  const fetchCurrentUser = async () => {
    if (!token.value) return;
    try {
      const { data } = await getCurrentUser();
      user.value = data.user;
      role.value = data.user.role;
      username.value = data.user.username;
    } catch (error) {
      console.error("Fetching user failed", error);
      logOut();
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      const { data } = await login(email, password);
      user.value = data.user;
      token.value = data.token;
      role.value = data.user.role;
      username.value = data.user.username;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);
    } catch (error: any) {
      throw new Error("Invalid credentials");
    }
  };

  // Register
  const registerUser = async (
    username: string,
    email: string,
    password: string,
    role: string = "student"
  ) => {
    try {
      const userResponse = await register(username, email, password, role);
      user.value = userResponse;
      token.value = userResponse.token;
      username = userResponse.username;

      localStorage.setItem("token", token.value);
      localStorage.setItem("role", userResponse.role);
      localStorage.setItem("username", userResponse.username);
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logOut = () => {
    user.value = null;
    token.value = "";
    role.value = "";
    username.value = "";
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  return {
    user,
    token,
    role,
    username,
    isAuthenticated,
    isAdmin,
    getUser,
    logIn,
    fetchCurrentUser,
    logOut,
    registerUser,
  };
});
