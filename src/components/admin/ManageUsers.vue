<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ManageUsersForm from "./ManageUsersForm.vue";
import { useUserStore } from "../../stores/userStore";
import { useMessageStore } from "../../stores/messageStore";
import type { User, UserRole } from "../../types/User";

const confirm = useConfirm();
const toast = useToast();
const messageStore = useMessageStore();
const userStore = useUserStore();

const selectedRole = ref<UserRole | null>(null);
const roleOptions = computed(() => {
  const roles = new Set(userStore.users.map((u) => u.role).filter(Boolean));
  return Array.from(roles).map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  }));
});
const users = computed(() => {
  if (!selectedRole.value) return userStore.users;
  return userStore.users.filter((user) => user.role === selectedRole.value);
});
const filteredUsers = computed(() => {
  return users.value;
});
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

const handleSave = async (updated: {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}) => {
  try {
    await saveUser(updated);
    await fetchAllUsers();
    selectedUser.value = null;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "✅ User updated successfully.",
      life: 3000,
    });
  } catch (err) {
    console.error("Error saving user:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "❌ Failed to update user.",
      life: 3000,
    });
  }
};

const handleDelete = async (event: MouseEvent, userId: string) => {
  const confirmPhrase = prompt("⚠ To confirm deletion, type YES:");
  if (confirmPhrase !== "YES") {
    toast.add({
      severity: "warn",
      summary: "Cancelled",
      detail: "⚠ Deletion cancelled: Incorrect confirmation phrase.",
      life: 3000,
    });
    return;
  }

  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Are you sure you want to delete this user?",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      try {
        await removeUser(userId);
        await fetchAllUsers();
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "✅ User deleted successfully.",
          life: 3000,
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "❌ Failed to delete user.",
          life: 3000,
        });
      }
    },
    reject: () => {
      toast.add({
        severity: "warn",
        summary: "Cancelled",
        detail: "⚠ Deletion cancelled",
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <div class="p-2 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Users</h2>

    <div class="rounded-lg overflow-hidden border border-gray-200">
      <DataTable
        paginator
        :rows="6"
        :value="filteredUsers"
        layout="grid"
        tableStyle=""
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Users</h2>
            <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="
                () => {
                  userStore.fetchAllUsers();
                  selectedRole = null;
                }
              "
            />
          </div>
        </template>
        <Column field="username" header="Username" class="w-1/3">
          <template #body="slotProps">
            <span class="capitalize">{{ slotProps.data.username }}</span>
          </template>
        </Column>
        <Column field="email" header="Email"></Column>
        <Column field="role">
          <template #header>
            <Select
              v-model="selectedRole"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Role"
              clearable
              fluid
            />
          </template>
          <template #body="slotProps">
            <span class="capitalize">{{ slotProps.data.role }}</span>
          </template>
        </Column>
        <Column header="Actions" class="space-x-2">
          <template #body="slotProps">
            <Button
              @click="editUser(slotProps.data)"
              class="text-blue-600"
              severity="info"
              icon="pi pi-pencil"
            />

            <Button
              @click="handleDelete($event, slotProps.data._id)"
              severity="danger"
              icon="pi pi-trash"
            />
          </template>
        </Column>
        <template #footer>
          In total, there are {{ filteredUsers.length }}
          {{ selectedRole ? selectedRole + "s" : "users" }}.
        </template>
      </DataTable>
    </div>
    <ManageUsersForm
      v-if="selectedUser"
      :user="selectedUser"
      :visible="!!selectedUser"
      @save="handleSave"
      @cancel="cancelEdit"
    />
    <ConfirmPopup />
    <Toast />
  </div>
</template>
