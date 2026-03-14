<template>
  <div :class="layout === 'grid' ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2'">
    <BookCard
      v-for="book in books"
      :key="book.id"
      :book="book"
      :layout="layout"
      :is-selected="selectedBooks.has(book.id)"
      @toggle-select="$emit('toggle-select', book.id)"
      @book-deleted="$emit('book-deleted', $event)"
    />
  </div>
</template>

<script setup>
import BookCard from "@/components/ui/BookCard.vue";

defineProps({
  books: {
    type: Array,
    required: true,
  },
  layout: {
    type: String,
    default: "grid",
  },
  selectedBooks: {
    type: Set,
    required: true,
  },
});

defineEmits(['toggle-select', 'book-deleted']);
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>