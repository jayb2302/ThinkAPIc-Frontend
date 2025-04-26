<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useProgressStore } from "../../stores/progressStore";
import { useQuizStore } from "../../stores/quizStore";
import { getTopicById } from "../../services/topicService";
import { attemptQuiz } from "../../services/quizService";
import { useAuthStore } from "../../stores/authStore";
import type { QuizOption } from "../../types/Quiz";

const props = defineProps<{
  visible: boolean;
  topicId: string;
  courseId: string;
}>();

const emit = defineEmits(["update:visible"]);

const quizStore = useQuizStore();
const authStore = useAuthStore();
const progressStore = useProgressStore();

const topicTitle = ref("Topic Quizzes");
const quizzes = ref<any[]>([]);
const selectedOptions = ref<Record<string, number | undefined>>({});
const results = ref<Record<string, { isCorrect: boolean }>>({});
const currentQuizIndex = ref(0);
const submitted = ref(false);

const isLastQuiz = computed(
  () => currentQuizIndex.value === quizzes.value.length - 1
);
const currentQuiz = computed(() => quizzes.value[currentQuizIndex.value]);

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.fetchCurrentUser();
  }

  await quizStore.fetchQuizzesByTopic(props.topicId);
  quizzes.value = quizStore.quizzes;
  quizzes.value.forEach((q) => (selectedOptions.value[q._id] = undefined));

  try {
    const topic = await getTopicById(props.topicId);
    topicTitle.value = topic.title;
  } catch (error) {
    console.error("❌ Failed to fetch topic title:", error);
  }
});

const closeDialog = (value: boolean) => {
  emit("update:visible", value);
  if (value === false && authStore.user) {
    progressStore.fetchProgress(authStore.user._id);
  }
};

const nextQuiz = () => {
  const quiz = currentQuiz.value;
  const selected = selectedOptions.value[quiz._id];

  if (selected == null) return;

  if (!isLastQuiz.value) {
    currentQuizIndex.value++;
  }
};

const submitAll = async () => {
  if (!authStore.user) return;

  const allAnswered = quizzes.value.every(
    (quiz) => selectedOptions.value[quiz._id] !== undefined
  );

  if (!allAnswered) {
    alert("❗ Please answer all questions before submitting.");
    return;
  }

  let allCorrect = true; 

  for (const quiz of quizzes.value) {
    const selected = selectedOptions.value[quiz._id];
    if (selected != null) {
      try {
        const selectedOption = quiz.options.find(
          (o: QuizOption) => o.order === selected
        );
        const isCorrect = selectedOption ? selectedOption.isCorrect : false;

        if (!isCorrect) allCorrect = false;

        const res = await attemptQuiz(quiz._id, {
          userId: authStore.user._id,
          selectedOptionOrder: selected,
          courseId: props.courseId,
          isCorrect,
        });
        results.value[quiz._id] = { isCorrect: res.isCorrect };
      } catch (error) {
        console.error("Failed to submit quiz", quiz._id, error);
      }
    }
  }

  console.log("✅ All quizzes submitted");
  await progressStore.fetchProgress(authStore.user._id);
  // 🔥 Now log progress if all correct
  if (allCorrect) {
    await progressStore.logProgress({
      user: authStore.user._id,
      course: props.courseId,
      topic: props.topicId,
      activityType: "quiz",
      activityTable: "quizzes",
      activityId: props.topicId,
      isCorrect: true,
    });
    console.log("🏁 Progress logged: Topic Completed");
    await progressStore.fetchProgress(authStore.user._id);
  } else {
    console.log("🚫 Progress not logged: User needs to retake");
  }

  submitted.value = true;
};

const retakeQuiz = () => {
  submitted.value = false;
  currentQuizIndex.value = 0;
  results.value = {};
  quizzes.value.forEach((q) => (selectedOptions.value[q._id] = undefined));
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :header="topicTitle"
    :style="{ width: '50vw' }"
    :dismissable-mask="true"
    :closable="true"
    @update:visible="closeDialog"
  >
    <div class="p-4">
      <h2 class="text-2xl mb-4">Quizzes</h2>

      <div v-if="quizzes.length === 0">No quizzes found for this topic.</div>

      <div v-else-if="!submitted">
        <Card v-if="currentQuiz">
          <template #title> {{ currentQuiz.question }}</template>
          <template #content>
            <div
              v-for="option in currentQuiz.options"
              :key="option.order"
              class="mb-2"
            >
              <RadioButton
                :inputId="`${currentQuiz._id}-${option.order}`"
                :name="currentQuiz._id"
                :value="option.order"
                v-model="selectedOptions[currentQuiz._id]"
              />
              <label :for="`${currentQuiz._id}-${option.order}`" class="ml-2">
                {{ option.text }}
              </label>
            </div>

            <Button
              class="mt-3"
              :label="isLastQuiz ? 'Submit All' : 'Next'"
              @click="isLastQuiz ? submitAll() : nextQuiz()"
            />
          </template>
        </Card>
      </div>

      <div v-else>
        <h2 class="text-2xl mb-4">Results</h2>

        <div v-for="quiz in quizzes" :key="quiz._id" class="mb-4">
          <Card>
            <template #title>{{ quiz.question }}</template>
            <template #content>
              <p>
                Your Answer:
                <strong>
                  {{
                    quiz.options.find(
                      (o: QuizOption) => o.order === selectedOptions[quiz._id]
                    )?.text || "Not answered"
                  }}
                </strong>
              </p>
              <p class="mt-2">
                Result:
                <span v-if="results[quiz._id]?.isCorrect" class="text-green-600"
                  >✅ Correct</span
                >
                <span v-else class="text-red-600">❌ Incorrect</span>
              </p>
            </template>
          </Card>
        </div>
        <div
          class="flex justify-center mt-6"
          v-if="Object.values(results).some((r) => !r.isCorrect)"
        >
          <Button
            label="🔄 Retake Quiz"
            severity="warning"
            @click="retakeQuiz"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
