import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  loginUser,
  updateUser,
  getAllUsers,
  deleteUser,
} from "../services/userService";
import type { User, UserRole } from "../types/User";

export const useUserStore = defineStore("user", () => {
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const token = ref<string | null>(localStorage.getItem("token"));
  const role = ref<string | null>(localStorage.getItem("role"));
  const user = ref<User | null>(null);
  const users = ref<User[]>([]);
  const isAuthenticated = computed(() => !!token.value);

  const isAdmin = computed(() => role.value === "admin");

  // 🔹 Fetch all users
  const fetchAllUsers = async () => {
    loading.value = true;
    try {
      users.value = await getAllUsers();
      console.log("✅ Users fetched successfully:", users.value);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      error.value = "Failed to load users.";
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("🔍 Sending Login Request:", { email, password });

      const data = await loginUser(email, password);

      console.log("✅ Login Successful! Token Received:", data.token);
      console.log("✅ User Role:", data.user.role);

      token.value = data.token;
      role.value = data.user.role;
      user.value = data.user;

      // ✅ Save token and role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "❌ API Login Error:",
          (error as any).response?.data || error.message
        );
      } else {
        console.error("❌ API Login Error:", error);
      }
      throw error;
    }
  };

  const logout = () => {
    token.value = null;
    role.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const saveUser = async (updated: {
    _id: string;
    username: string;
    email: string;
    role: string;
  }) => {
    try {
      const updatedUser = await updateUser(updated._id, {
        _id: updated._id,
        username: updated.username,
        email: updated.email,
        role: updated.role as UserRole,
      });

      const index = users.value.findIndex((u: User) => u._id === updated._id);
      if (index !== -1) users.value[index] = updatedUser;
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      users.value = users.value.filter((u) => u._id !== userId);
      console.log("🗑️ User deleted:", userId);
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      error.value = "Failed to delete user.";
    }
  };

  return {
    fetchAllUsers,
    token,
    role,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    user,
    users,
    saveUser,
    removeUser,
  };
});
