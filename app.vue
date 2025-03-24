<template>
  <div class="container mx-auto px-4 py-8">
    <!-- BookShelfに値を渡さない -->
    <BookShelf displayOption="card" />
  </div>
</template>

<script lang="ts" setup>
import BookShelf from './components/BookShelf.vue';
</script>