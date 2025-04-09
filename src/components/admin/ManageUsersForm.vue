<script setup lang="ts">
import { ref, watch } from "vue";
import type { User } from "../../types/User";

const props = defineProps<{
  user: User | null;
}>();

const emit = defineEmits(["save", "cancel"]);

const editedUsername = ref("");
const editedEmail = ref("");
const editedRole = ref<"admin" | "student">("student");

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      editedUsername.value = newUser.username;
      editedEmail.value = newUser.email;
      editedRole.value = newUser.role;
    }
  },
  { immediate: true }
);

const handleSave = () => {
  if (!props.user) return;
  emit("save", {
    _id: props.user._id,
    username: editedUsername.value,
    email: editedEmail.value,
    role: editedRole.value,
  });
};
</script>

<template>
  <div v-if="user" class="p-4 space-y-4 rounded shadow">
    <h3 class="text-lg font-semibold mb-4">Edit User</h3>
    <FloatLabel variant="on">
      <InputText id="username" v-model="editedUsername" fluid />
      <label for="username">Username</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <InputText id="email" v-model="editedEmail" fluid />
      <label for="email">Email</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <Select
        id="role"
        v-model="editedRole"
        :options="[
          { label: 'Student', value: 'student' },
          { label: 'Admin', value: 'admin' },
        ]"
        optionLabel="label"
        optionValue="value"
        placeholder="Select a role"
        fluid
      />
      <label for="role">Role</label>
    </FloatLabel>

    <div class="button-group flex justify-end gap-2">
      <Button
        @click="handleSave"
        severity="success"
        label="Save"
        icon="pi pi-check"
        class="bg-green-500 text-white px-4 py-1 rounded"
      />

      <Button
        @click="$emit('cancel')"
        label="Cancel"
        icon="pi pi-times"
        />
      
    </div>
  </div>
</template>
