import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { loginUser } from "../services/userService";

export const useUserStore = defineStore("user", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const role = ref<string | null>(localStorage.getItem("role"));

  const isAdmin = computed(() => role.value === "admin");
  const login = async (email: string, password: string) => {
    try {
      console.log("🔍 Sending Login Request:", { email, password });

      const data = await loginUser(email, password);

      console.log("✅ Login Successful! Token Received:", data.token);
      console.log("✅ User Role:", data.user.role);

      token.value = data.token;
      role.value = data.user.role;

      // ✅ Save token and role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ API Login Error:", (error as any).response?.data || error.message);
      } else {
        console.error("❌ API Login Error:", error);
      }
      throw error;
    }
  };

  const logout = () => {
    token.value = null;
    role.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return { token, role, login, logout, isAdmin };
});