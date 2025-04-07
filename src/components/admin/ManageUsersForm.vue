<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '../../types/User';

const props = defineProps<{
  user: User | null;
}>();

const emit = defineEmits(['save', 'cancel']);

const editedUsername = ref('');
const editedEmail = ref('');
const editedRole = ref<'admin' | 'student'>('student');

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
  emit('save', {
    _id: props.user._id,
    username: editedUsername.value,
    email: editedEmail.value,
    role: editedRole.value
  });
};
</script>

<template>
  <div v-if="user" class="p-4 border rounded shadow">
    <h3 class="text-lg font-semibold mb-2">Edit User</h3>
    <label class="block mb-1">Username:</label>
    <input v-model="editedUsername" type="text" class="border p-2 w-full mb-3" />
    <input v-model="editedEmail" type="text" class="border p-2 w-full mb-3">
    <label class="block mb-1">Role:</label>
    <select v-model="editedRole" class="border p-2 w-full mb-3">
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>

    <div class="flex gap-2">
      <button @click="handleSave" class="bg-green-500 text-white px-4 py-1 rounded">Save</button>
      <button @click="$emit('cancel')" class="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
    </div>
  </div>
</template>
