import { defineStore } from "pinia";
import { login, getCurrentUser } from "../services/authService";
import type { User } from "../types/User";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem("token") || "",
    role: localStorage.getItem("role") || "",
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role === "admin",
    getUser: (state) => state.user,
  },
  actions: {
    async logIn(email: string, password: string) {
      try {
        const { data } = await login(email, password);
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem("token", data.token);
      } catch (error: any) {
        this.logOut(); // authentication failed
        throw new Error("Invalid credentials");
      }
    },
    async fetchCurrentUser() {
      if (!this.token) return;
      try {
        const { data } = await getCurrentUser();
        this.user = data.user;
        this.role = data.user.role;
      } catch (error) {
        console.error("Fetching user failed", error);
        this.logOut(); // clear invalid token
      }
    },
    logOut() {
      this.user = null;
      this.token = "";
      this.role = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});
