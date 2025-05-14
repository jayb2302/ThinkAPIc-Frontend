<script setup lang="ts">
import { ref, watch } from "vue";
import type { User } from "../../types/User";

const props = defineProps<{
  user: User | null;
  visible: boolean;
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
  <Dialog
    v-model:visible="props.visible"
    modal
    class="!w-full !max-w-md"
    header="Edit User"
    @hide="$emit('cancel')"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
    style="
      background-image: radial-gradient(
        circle at center center,
        var(--p-primary-400),
        var(--p-primary-300)
      );
    "
  >
    <div class="space-y-4 pt-4">
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
        <Button @click="$emit('cancel')" label="Cancel" icon="pi pi-times" class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-red-600/30 hover:!bg-red-700/10 hover:!text-gray-50" />
        <Button
          @click="handleSave"
          severity="success"
          label="Save"
          icon="pi pi-check"
          class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-green-600/30 hover:!bg-green-700/10 hover:!text-gray-50"
        />
      </div>
    </div>
  </Dialog>
</template>
