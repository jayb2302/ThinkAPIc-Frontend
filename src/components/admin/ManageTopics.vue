<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useTopicStore } from "../../stores/topicStore";
import ManageTopicForm from "./ManageTopicForm.vue";
import type { Topic } from "../../types/Topic";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

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
  showForm.value = false;
  selectedTopic.value = null;

  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

// Delete topic
const deleteTopic = async (event: MouseEvent, topic: Topic) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Are you sure you want to delete the topic "${topic.title}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      await topicStore.deleteTopic(topic._id);
      await topicStore.fetchTopics();
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Topic deleted successfully!",
        life: 3000,
      });
    },
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Cancelled",
        detail: "Topic deletion cancelled.",
        life: 2500,
      });
    },
  });
};
// Refresh topics
const refreshTopics = async () => {
  try {
    await topicStore.fetchTopics();
    toast.add({
      severity: "success",
      summary: "Refreshed",
      detail: "Topics refreshed successfully!",
      life: 3000,
    });
  } catch (err) {
    console.error("Error refreshing topics:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to refresh topics.",
      life: 3000,
    });
  }
};

// Reset form state
const closeForm = () => {
  selectedTopic.value = null;
  showForm.value = false;
};
</script>

<template>
  <div class="p-2 rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Topics</h2>

    <Button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      label="New Topic"
      icon="pi pi-plus"
    />

    <!-- Topic Form -->
    <ManageTopicForm
      v-model:visible="showForm"
      :topic="selectedTopic"
      @topic-updated="handleTopicUpdated"
      @close="closeForm"
    />
    <div class="rounded-lg overflow-hidden shadow border border-gray-200">
      <DataTable :value="topicList" paginator :rows="6" tableStyle="">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xl font-bold">Topics</span>
            <Button
              icon="pi pi-refresh"
              aria-label="Refresh"
              rounded
              outlined
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
              @click="(e) => deleteTopic(e, slotProps.data)"
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
    <ConfirmPopup />
  </div>
</template>
