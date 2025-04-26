<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "vue-router";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(["update:visible"]);

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.logIn(email.value, password.value);
    await authStore.fetchCurrentUser();
    if (authStore.isAuthenticated) {
      errorMessage.value = "";
      emit("update:visible", false); 
      if (authStore.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  } catch (error) {
    errorMessage.value = "Invalid email or password";
  }
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
        <div
          class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
          style="
            background-image: radial-gradient(
              circle at left top,
              var(--p-primary-400),
              var(--p-primary-700)
            );
          "
        >
        <img src="/ExplodingHead.svg" alt="Exploding Head" class="w-10 h-10 mx-auto " />

          <div class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <InputText
                id="username"
                v-model="email"
                type="email"
                class="!bg-white/20 !border-0 !text-slate-300 w-80"
                required
              />
              <label for="username" class=" font-semibold"
                >Email</label
              >
            </FloatLabel>
          </div>
          <div class="inline-flex flex-col gap-2">
            <FloatLabel variant="on">
              <Password
                id="password"
                v-model="password"
                inputClass="!bg-white/20 !border-0  !text-slate-0 w-80"
                type="text"
                :feedback="false"
                toggleMask
                required
                fluid
              />
              <label for="password" class="text-primary-50 font-semibold"
                >Password</label
              >
            </FloatLabel>
          </div>
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
              label="Sign-In"
              @click="handleLogin"
              text
              class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>
