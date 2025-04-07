<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ManageUsersForm from "./ManageUsersForm.vue";
import { useUserStore } from "../../stores/userStore";
import { useMessageStore } from "../../stores/messageStore";
import type { User, UserRole } from "../../types/User";

const messageStore = useMessageStore()
const userStore = useUserStore();

const users = computed(() => userStore.users);
const { saveUser, fetchAllUsers, removeUser } = userStore;
const selectedUser = ref<User | null>(null);
const errorMessage = ref("");
const successMessage = ref("");

onMounted(async () => {
  try {
    await fetchAllUsers();
  } catch (err) {
    messageStore.showError("❌ Failed to fetch users.");
  }
});

const editUser = (user: User) => {
  selectedUser.value = { ...user };
};

const cancelEdit = () => {
  selectedUser.value = null;
  successMessage.value = "";
  errorMessage.value = "";
};

const handleSave = async (updated: { _id: string; username: string; email: string; role: UserRole }) => {
  try {
    await saveUser(updated);
    await fetchAllUsers();
    selectedUser.value = null;
    messageStore.showSuccess("✅ User updated successfully.");
  } catch (err) {
    console.error("Error saving user:", err);
    messageStore.showError("❌ Failed to update user.");
  }
};

const handleDelete = async (userId: string) => {
  // Ask for password confirmation before deletion
  const confirmedPhrase = prompt("⚠ To confirm deletion, type YES:");
  
  // Check if the phrase is correct
  if (confirmedPhrase === null || confirmedPhrase.toUpperCase() !== "YES") {
    messageStore.showError("⚠ Deletion cancelled: Incorrect confirmation phrase.");
    return;
  }
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await removeUser(userId);
    await fetchAllUsers();
    messageStore.showSuccess("✅ User deleted successfully.");
  } catch (err) {
    console.error("Error deleting user:", err);
    messageStore.showError("❌ Failed to delete user.");
  }
};
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Manage Users</h2>

    <!-- <p v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-green-600 mb-2">{{ successMessage }}</p> -->

    <table class="w-full table-auto text-left border-collapse border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2">Username</th>
          <th class="border px-4 py-2">Email</th>
          <th class="border px-4 py-2">Role</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" class="border-t">
          <td class="border px-4 py-2 capitalize">{{ user.username }}</td>
          <td class="border px-4 py-2">{{ user.email }}</td>
          <td class="border px-4 py-2 capitalize">{{ user.role }}</td>
          <td class="border px-4 py-2">
            <button
              @click="editUser(user)"
              class="text-blue-600 hover:underline mr-2"
            >
              ✏ Edit
            </button>
            <button
              @click="handleDelete(user._id)"
              class="text-red-600 hover:underline"
            >
              🗑 Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <ManageUsersForm
      v-if="selectedUser"
      :user="selectedUser"
      @save="handleSave"
      @cancel="cancelEdit"
    />
  </div>
</template>
