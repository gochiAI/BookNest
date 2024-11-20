<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div v-for="book in books" :key="book.id" class="bg-white rounded-lg shadow-md overflow-hidden">
      <img :src="book.cover || '/placeholder.svg?height=200&width=150'" :alt="book.title"
        class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">{{ book.title }}</h3>
        <p class="text-sm text-gray-600">{{ book.author.name }}</p>
        <p v-if="book.series" class="text-sm text-gray-500">{{ book.series.name }} #{{ book.volume || 'N/A' }}</p>
        <div class="mt-2 flex justify-between items-center">
          <status-class :status="book.readStatus.name" />
          <span class="text-xs text-gray-500">{{ book.bookType.name }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Released: {{ formatDate(book.releaseDate) }}
        </p>
        <p class="text-xs text-gray-500">
          ISBN: {{ book.isbn || 'N/A' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import statusClass from '~/components/readStatusIcon.vue'
defineComponent({
  props: {
    books: {
      type: Array,
      required: true
    }
  }
});
defineProps({
  books: {
    type: Array,
    required: true
  }
});
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>