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
// Refresh topics
const refreshTopics = async () => {
  try {
    await topicStore.fetchTopics();
    successMessage.value = "✅ Topics refreshed successfully!";
  } catch (err) {
    console.error("Error refreshing topics:", err);
    successMessage.value = "❌ Failed to refresh topics.";
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

    <Button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    >
      ➕ Add New Topic
    </Button>

    <!-- Topic Form -->
    <ManageTopicForm
      v-if="showForm"
      :topic="selectedTopic"
      @topic-updated="handleTopicUpdated"
      @close="closeForm"
    />
    <div class="rounded-lg overflow-hidden shadow border border-gray-200">
      <DataTable :value="topicList" tableStyle="min-width: 50rem">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xl font-bold">Topics</span>
            <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="refreshTopics"
            />
          </div>
        </template>

        <!-- Question Column -->
        <Column field="title" header="Title"></Column>
        <Column field="week" header="Week"></Column>

        <!-- Actions Column -->
        <Column header="Actions" class="space-x-2">
          <template #body="slotProps">
            <Button
              @click="editTopic(slotProps.data)"
              severity="info"
              icon="pi pi-pencil"
            />
            <Button
              @click="deleteTopic(slotProps.data._id)"
              severity="danger"
              icon="pi pi-trash"
            />
          </template>
        </Column>

        <template #footer>
          In total, there are {{ topicList ? topicList.length : 0 }} topics.
        </template>
      </DataTable>
    </div>
  </div>
</template>
