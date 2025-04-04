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
  <div>
    <h3 class="bg-amber-200">Topic Challenge: {{ challenge.topic }}</h3>
    <p class="mb-4">{{ challenge.problem }}</p>

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

    <div class="editor-container">
      <CodeEditor
        v-model="code"
        :line-nums="true"
        :languages="[['javascript', 'JavaScript']]"
        width="100%"
        min-height="300px"
        theme="atom-one-dark"

      />
    </div>

    <button @click="runCode">Run Code</button>
    <p>{{ output }}</p>

    <!-- Hints Section -->
    <div class="mt-4">
      <button @click="toggleHints">
        {{ showHints ? "Hide Hints" : "Show Hints" }}
      </button>
      <div v-if="showHints">
        <p
          v-for="(hint, index) in challenge.hints.slice(0, hintIndex)"
          :key="index"
        >
          💡 {{ hint }}
        </p>
        <button v-if="hintIndex < challenge.hints.length" @click="revealHint">
          Next Hint
        </button>
      </div>
    </div>

    <!-- Reveal Answer (Toggles Code Editor Content) -->
    <div class="mt-4">
      <button @click="toggleAnswer">
        {{ showAnswer ? "Hide Answer" : "Show Answer" }}
      </button>
    </div>
  </div>
</template>
