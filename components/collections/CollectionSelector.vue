<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <InputBox
        v-model="searchQuery"
        placeholder="Search collections..."
        class="flex-1"
      />
    </div>

    <div v-if="filteredCollections.length > 0" class="space-y-2">
      <div
        v-for="collection in filteredCollections"
        :key="collection.id"
        class="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition"
        @click="$emit('select', collection)"
      >
        <h4 class="font-medium">{{ collection.name }}</h4>
        <p v-if="collection.description" class="text-sm text-gray-600">
          {{ collection.description }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ collection._count?.books || 0 }} book(s)
        </p>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <p>No collections found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InputBox from '@/components/ui/InputBox.vue';

const searchQuery = ref('');
const collections = ref([]);

const filteredCollections = computed(() => {
  if (!searchQuery.value.trim()) return collections.value;

  const query = searchQuery.value.toLowerCase();
  return collections.value.filter(
    (col) =>
      col.name.toLowerCase().includes(query) ||
      col.description?.toLowerCase().includes(query)
  );
});

const loadCollections = async () => {
  try {
    const response = await fetch('/api/collections');
    if (!response.ok) throw new Error('Failed to fetch collections');
    const result = await response.json();
    collections.value = result.data || [];
  } catch (error) {
    console.error('Error loading collections:', error);
  }
};

const emit = defineEmits(['select']);

onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
/* スタイル */
</style>
