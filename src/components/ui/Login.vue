<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "vue-router";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(["update:visible"]);

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const authStore = useAuthStore();
const router = useRouter();
const isRegistering = ref(false);

// Handle login
const handleLogin = async () => {
  try {
    await authStore.logIn(email.value, password.value);
    if (authStore.isAuthenticated) {
      errorMessage.value = "";
      emit("update:visible", false); // Close dialog after successful login
      router.push("/admin");
    }
  } catch (error) {
    errorMessage.value = "Invalid email or password"; // Show error message
  }
};

// Handle registration
const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match";
    return;
  }
  try {
    await authStore.registerUser(username.value, email.value, password.value);
    errorMessage.value = "";
    isRegistering.value = false; // Switch back to login mode
  } catch (error) {
    errorMessage.value = "Registration failed";
  }
};

// Toggle between Login and Register mode
const toggleForm = () => {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = "";
};
</script>

<template>
  <div class="card flex justify-center">
    <Dialog
      :visible="props.visible"
      @update:visible="(value) => emit('update:visible', value)"
      modal
      :pt="{
        root: { class: '!border-0 !bg-transparent' },
        mask: { class: 'backdrop-blur-sm' },
      }"
    >
      <template #container="{ closeCallback }">
        <form
          @submit.prevent="handleLogin"
          class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
          style="background-image: radial-gradient(circle at left top, var(--p-primary-400), var(--p-primary-700));"
        >
          <img
            src="/ExplodingHead.svg"
            alt="Exploding Head"
            class="w-10 h-10 mx-auto"
          />

          <!-- Email -->
          <div class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <InputText
                id="username"
                v-model="email"
                type="email"
                class="!bg-white/20 !border-0 !text-slate-300 w-80"
                required
              />
              <label for="username" class="font-semibold">Email</label>
            </FloatLabel>
          </div>

          <!-- Password -->
          <div class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <Password
                id="password"
                v-model="password"
                inputClass="!bg-white/20 !border-0 !text-slate-0 w-80"
                type="text"
                :feedback="false"
                toggleMask
                required
                fluid
              />
              <label for="password" class="text-primary-50 font-semibold">Password</label>
            </FloatLabel>
          </div>

          <!-- Confirm Password -->
          <div v-if="isRegistering" class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <Password
                id="confirm-password"
                v-model="confirmPassword"
                inputClass="!bg-white/20 !border-0 !text-slate-0 w-80"
                type="text"
                :feedback="false"
                toggleMask
                required
                fluid
              />
              <label for="confirm-password" class="text-primary-50 font-semibold">Confirm Password</label>
            </FloatLabel>
          </div>

          <!-- Name -->
          <div v-if="isRegistering" class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <InputText
                id="name"
                v-model="username"
                type="text"
                class="!bg-white/20 !border-0 !text-slate-300 w-80"
                required
              />
              <label for="name" class="font-semibold">Name</label>
            </FloatLabel>
          </div>

          <!-- Error -->
          <p v-if="errorMessage" class="text-red-200 text-sm mt-2">
            {{ errorMessage }}
          </p>

          <div class="flex items-center gap-4">
            <Button
              label="Cancel"
              @click="closeCallback"
              text
              class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
            />
            <Button
              v-if="!isRegistering"
              label="Sign-In"
              type="submit"
              text
              class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
            />
            <Button
              v-if="isRegistering"
              label="Register"
              @click="handleRegister"
              text
              class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
            />
          </div>

          <div class="text-center mt-2">
            <span v-if="!isRegistering">
              Don't have an account?
              <a href="#" @click="toggleForm" class="text-blue-500">Register</a>
            </span>
            <span v-if="isRegistering">
              Already have an account?
              <a href="#" @click="toggleForm" class="text-blue-500">Login</a>
            </span>
          </div>
        </form>
      </template>
    </Dialog>
  </div>
</template>
