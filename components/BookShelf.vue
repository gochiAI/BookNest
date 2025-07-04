<template>
  <div :class="layout === 'grid' ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2'">
    <BookCard
      v-for="book in books"
      :key="book.id"
      :book="book"
      :layout="layout"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import BookCard from "@/components/ui/BookCard.vue";

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
  layout: {
    type: String,
    default: "grid",
  },
});

</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>