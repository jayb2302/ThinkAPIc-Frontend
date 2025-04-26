import { defineStore } from "pinia";
import { ref } from "vue";
import {
  updateUser,
  getAllUsers,
  deleteUser,
} from "../services/userService";
import type { User, UserRole } from "../types/User";

export const useUserStore = defineStore("user", () => {
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const user = ref<User | null>(null);
  const users = ref<User[]>([]);

  // 🔹 Fetch all users
  const fetchAllUsers = async () => {
    loading.value = true;
    try {
      users.value = await getAllUsers();
      //console.log("✅ Users fetched successfully:", users.value);
    } catch (err) {
      //console.error("❌ Error fetching users:", err);
      error.value = "Failed to load users.";
    } finally {
      loading.value = false;
    }
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
    user,
    users,
    saveUser,
    removeUser,
  };
});
