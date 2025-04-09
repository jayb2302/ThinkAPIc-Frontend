<script setup lang="ts">
import { ref, onMounted } from "vue";

// Hardcoded challenge related to "User Authentication & JWT"
const challenge = ref({
  topic: "User Authentication & JWT",
  problem:
    "Write an Express.js middleware function that verifies a JWT token from the request header.",
  example_input: `Authorization: Bearer <JWT_TOKEN>`,
  example_output: `{"message": "Token verified. Access granted."}`,
  solution: `export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'your_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};`,
  hints: [
    "Extract the token from the Authorization header using `req.header('Authorization')`.",
    "Use `jwt.verify(token, 'your_secret_key')` to validate the token.",
    "Attach the decoded user info to `req.user` and call `next()`.",
  ],
});

const code = ref("");
const output = ref("");
const hintIndex = ref(0);
const showHints = ref(false);
const showAnswer = ref(false);

// Function to check user input
const runCode = () => {
  if (!challenge.value) {
    output.value = "❌ No challenge loaded.";
    return;
  }

  if (code.value.trim() === challenge.value.solution.trim()) {
    output.value = "✅ Correct answer!";
  } else {
    output.value = "❌ Incorrect answer. Try again!";
  }
};

// Show all revealed hints so far
const revealHint = () => {
  if (hintIndex.value < challenge.value.hints.length) {
    hintIndex.value++;
  }
};

// Toggle hints visibility
const toggleHints = () => {
  showHints.value = !showHints.value;
  if (showHints.value && hintIndex.value === 0) {
    hintIndex.value = 1; // Start showing hints when first opened
  }
};

// Toggle the correct answer inside the editor
const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value;
  code.value = showAnswer.value ? challenge.value.solution : ""; // Fill or clear the editor
};

console.log("Vue script is running");

// Simulate fetching challenge on mount
onMounted(() => {
  console.log("Challenge loaded:", challenge.value);
});
</script>

<template>
  <div class="w-full">
    <h3 class="text-md bg-amber-200 font-semibold p-2 rounded">
      Topic Challenge:
      <span class="font-bold">
        {{ challenge.topic }}
      </span>
    </h3>
    <p class="mb-4 p-2 font-bold flex flex-col space-y-4 bg-red-50 rounded">
      ⚠️ Problem:
      <span class="font-light text-xl">
        {{ challenge.problem }}
      </span>
    </p>

    <div class="example bg-gray-100 p-2 rounded">
      <p>
        <strong>Example Input:</strong>
        <code>{{ challenge.example_input }}</code>
      </p>
      <p>
        <strong>Expected Output:</strong>
        <code>{{ challenge.example_output }}</code>
      </p>
    </div>
    <!-- Hints Section -->
    <div class="mt-4">
      <Button
        icon="pi pi-lightbulb"
        :label="showHints ? 'Hide Hints' : 'Show Hints'"
        severity="info"
        @click="toggleHints"
      />
      <div v-if="showHints">
        <Button
          icon="pi pi-arrow-right"
          :label="
            hintIndex < challenge.hints.length ? 'Next Hint' : 'No More Hints'
          "
          v-if="hintIndex < challenge.hints.length"
          @click="revealHint"
        />
        <div class="bg-gray-100 p-2 rounded mt-2">
        <p
          v-for="(hint, index) in challenge.hints.slice(0, hintIndex)"
          :key="index"
          class="text-gray-700 bg-gray-200 p-2 rounded mt-2"
        >
           {{ hint }}
        </p>
        </div>
        
      </div>
    </div>
    <div class="editor-container mt-4">
      <CodeEditor
        v-model="code"
        :line-nums="true"
        :languages="[['javascript', 'JavaScript']]"
        width="100%"
        min-height="300px"
        theme="atom-one-dark"
      />
    </div>

    <p>{{ output }}</p>

    <!-- Reveal Answer (Toggles Code Editor Content) -->
    <div class="mt-4 flex gap-2 justify-end">
    <Button severity="success" @click="runCode">Run Code</Button>
      <Button @click="toggleAnswer">
        {{ showAnswer ? "Hide Answer" : "Show Answer" }}
      </Button>
    </div>
  </div>
</template>
