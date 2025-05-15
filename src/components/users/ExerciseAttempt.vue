<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Exercise } from '../../types/Exercise';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps<{
  visible: boolean;
  exercise: Exercise;
  courseId: string;
}>();

const emit = defineEmits(['update:visible', 'close']);
const answers = ref<(string | string[])[]>([]); // Allows answers to be string or array of strings

const visibleRef = ref(props.visible);

watch(() => props.visible, (val) => visibleRef.value = val);
watch(visibleRef, (val) => emit('update:visible', val));

const currentQuestionIndex = ref(0);

const textAnswer = computed({
  get: () => {
    const value = answers.value[currentQuestionIndex.value];
    return typeof value === 'string' ? value : '';
  },
  set: (val: string) => {
    answers.value[currentQuestionIndex.value] = val;
  },
});

const exerciseStore = useExerciseStore();
const authStore = useAuthStore();

const submit = async () => {
  const timeSpent = 0;

  const currentQ = props.exercise.questions[currentQuestionIndex.value];
  const userAnswer = answers.value[currentQuestionIndex.value];
  let isCorrect = true;

  if (currentQ.type === 'multiple-choice') {
    const correctOptions = currentQ.options?.filter(opt => opt.isCorrect).map(opt => opt.text) || [];
    const userSelected = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    isCorrect = correctOptions.length === userSelected.length &&
                correctOptions.every(opt => userSelected.includes(opt));
  } else {
    isCorrect = typeof userAnswer === 'string' && userAnswer.trim() === currentQ.correctAnswer?.trim();
  }

  try {
    await exerciseStore.submitExerciseAttempt(
      props.exercise._id,
      authStore.user?._id || '',
      props.courseId,
      timeSpent,
      isCorrect,
      isCorrect
    );

    toast.add({
      severity: 'success',
      summary: 'Exercise Submitted',
      detail: isCorrect ? 'Correct answer! Progress saved.' : 'Submitted, but answer was incorrect.',
      life: 3000,
    });

    emit('update:visible', false);
  } catch (error: any) {
    console.error('❌ Failed to submit exercise attempt:', error);
    toast.add({
      severity: 'error',
      summary: 'Submission Failed',
      detail: error?.response?.data?.error || 'Something went wrong.',
      life: 3000,
    });
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header=" `${props.exercise.title} Exercise`"
    :style="{ width: '60vw' }"
    :dismissable-mask="true"
    :closable="true"
    style="
      background-image: radial-gradient(
        circle at center center,
        var(--p-primary-300),
        var(--p-primary-200)
      );
    "
    @update:visible="(val) => emit('update:visible', val)"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
  >
    

    <div v-if="props.exercise.questions.length">
      <h3>{{ props.exercise.questions[currentQuestionIndex].question }}</h3>

      <div v-if="props.exercise.questions[currentQuestionIndex].type === 'multiple-choice'">
        <div
          v-for="(opt, oIndex) in props.exercise.questions[currentQuestionIndex].options"
          :key="oIndex"
        >
          <Checkbox
            :value="opt.text"
            v-model="answers[currentQuestionIndex]"
            :binary="false"
          /> {{ opt.text }}
        </div>
      </div>

      <div v-else>
        <Textarea v-model="textAnswer" />
      </div>

      <div
        class="flex gap-2 mt-4"
        v-if="currentQuestionIndex < props.exercise.questions.length - 1"
      >
        <Button
          label="Previous"
          :disabled="currentQuestionIndex === 0"
          @click="currentQuestionIndex--"
        />
        <Button
          label="Next"
          :disabled="currentQuestionIndex === props.exercise.questions.length - 1"
          @click="currentQuestionIndex++"
        />
      </div>
      </div>
    <div v-if="currentQuestionIndex === props.exercise.questions.length - 1" class="flex gap-2 mt-4">
      <Button label="Cancel" severity="secondary" @click="emit('update:visible', false)" />
      <Button label="Submit" @click="submit" />
    </div>
  </Dialog>
  <Toast />
</template>