<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const userStore = useUserStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await userStore.login(email.value, password.value);
    router.push("/admin"); // Redirect to home after login
  } catch (error) {
    errorMessage.value = "Invalid email or password";
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-gray shadow-md rounded-md">
    <h2 class="text-2xl font-bold mb-4">Login</h2>

    <form @submit.prevent="handleLogin">
      <label class="block mb-2">Email:</label>
      <input
        v-model="email"
        type="email"
        required
        class="border p-2 w-full mb-4"
      />

      <label class="block mb-2">Password:</label>
      <input
        v-model="password"
        type="password"
        required
        class="border p-2 w-full mb-4"
      />

      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md">
        Login
      </button>
    </form>

    <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
  </div>
</template>
