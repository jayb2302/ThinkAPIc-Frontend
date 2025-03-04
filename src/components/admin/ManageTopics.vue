<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTopicStore } from "../../stores/topicStore";
import ManageTopicForm from "./ManageTopicForm.vue";
import type { Topic } from "../../types/Topic";

const topicStore = useTopicStore();
const showForm = ref(false);
const selectedTopic = ref<Topic | null>(null);
const successMessage = ref<string | null>(null);

// Fetch topics on mount
onMounted(() => {
  topicStore.fetchTopics();
});

// Computed property to keep topics reactive
const topicList = computed(() => topicStore.topics);

// Open edit mode
const editTopic = (topic: Topic) => {
  selectedTopic.value = { ...topic };
  showForm.value = true;
};

// Handle topic submission (refresh list after adding/editing)
const handleTopicUpdated = async () => {
  await topicStore.fetchTopics();
  successMessage.value = "✅ Topic updated successfully!";
  showForm.value = false;
  selectedTopic.value = null;

  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

// Delete topic
const deleteTopic = async (topicId: string) => {
  if (confirm("Are you sure you want to delete this topic?")) {
    await topicStore.deleteTopic(topicId);
    await topicStore.fetchTopics(); 
    successMessage.value = "✅ Topic deleted successfully!";

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
};

// Reset form state
const closeForm = () => {
  selectedTopic.value = null;
  showForm.value = false;
};
</script>

<template>
  <!-- ✅ Success Message -->
  <div v-if="successMessage" class="bg-green-500 text-white p-3 rounded mb-4">
    {{ successMessage }}
  </div>

  <div class="p-6 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Topics</h2>

    <button @click="showForm = true" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">
      ➕ Add New Topic
    </button>

    <!-- Topic Form -->
    <ManageTopicForm
      v-if="showForm"
      :topic="selectedTopic"
      @topic-updated="handleTopicUpdated"
      @close="closeForm"
    />

    <!-- Topic List -->
    <table class="w-full table-auto text-left border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">Title</th>
          <th class="border px-4 py-2">Week</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="topic in topicList" :key="topic._id" class="border-b">
          <td class="border px-4 py-2">{{ topic.title }}</td>
          <td class="border px-4 py-2">{{ topic.week }}</td>
          <td class="border px-4 py-2">
            <button @click="editTopic(topic)" class="text-blue-500 mr-2">
              ✏️ Edit
            </button>
            <button @click="deleteTopic(topic._id)" class="text-red-500">
              🗑 Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>