<template>
  <div 
    class="border rounded-lg p-4 bg-white hover:shadow-lg transition cursor-pointer"
    @click="$emit('click-card')"
  >
    <h3 class="font-bold text-lg text-gray-800 mb-3">{{ name }}</h3>
    <p class="text-sm text-gray-600 mb-3">{{ bookCount }} book(s)</p>
    <p v-if="description" class="text-sm text-gray-600 mb-3 line-clamp-2">{{ description }}</p>
    
    <!-- 本のサムネイル表示 -->
    <div v-if="books && books.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
      <div 
        v-for="book in books.slice(0, maxBooks)" 
        :key="book.id" 
        class="relative group cursor-pointer"
        @click.stop="$emit('click-book', book.id)"
      >
        <img
          v-if="book.coverUrl"
          :src="book.coverUrl"
          :alt="book.title"
          class="w-full aspect-[2/3] object-cover rounded shadow-sm"
        />
        <div v-else class="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
          <Icon name="library" size="24" class="text-gray-400" />
        </div>
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded flex items-end p-1">
          <p class="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition">{{ book.title }}</p>
        </div>
      </div>
    </div>
    
    <!-- アクションボタン（オプション） -->
    <slot name="actions">
      <button 
        class="w-full text-sm font-medium"
        :class="buttonClass"
      >
        → View All Books
      </button>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/icons.vue';

defineProps({
  name: {
    type: String,
    required: true,
  },
  bookCount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  books: {
    type: Array,
    default: () => [],
  },
  maxBooks: {
    type: Number,
    default: 5,
  },
  buttonClass: {
    type: String,
    default: 'text-blue-600 hover:text-blue-700',
  },
});

defineEmits(['click-card', 'click-book']);
</script>

<style scoped>
/* スタイル */
</style>
