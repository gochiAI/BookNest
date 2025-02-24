<template>
  <div>
    <div v-if="displayOption === 'grid'" id="grid">
      <CardBook v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>
    <div v-else id="list">
      <ListBook v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import CardBook from './CardBook.vue';
import ListBook from './ListBook.vue';

const props = defineProps({
  readStatus: {
    type: String,
    required: true
  },
  bookType: {
    type: String,
    required: true
  },
  search: {
    type: String,
    required: true
  },
  displayOption: {
    type: String,
    required: true
  }
});

const books = ref([]);

const fetchBooks = async () => {
  try {
    const response = await $fetch('/api/books', {
      params: {
        readStatus: props.readStatus,
        bookType: props.bookType,
        search: props.search
      }
    });
    books.value = response || [];
  } catch (error) {
    console.error('Error fetching books:', error);
  }
};

watch([() => props.readStatus, () => props.bookType, () => props.search], fetchBooks, { immediate: true });

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const matchesReadStatus = props.readStatus === 'all' || book.readStatus === props.readStatus;
    const matchesBookType = props.bookType === 'all' || book.bookType === props.bookType;
    const matchesSearch = book.title.toLowerCase().includes(props.search.toLowerCase());
    return matchesReadStatus && matchesBookType && matchesSearch;
  });
});

const sortedBooks = computed(() => {
  return filteredBooks.value.slice().sort((a, b) => {
    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
    if (a.volume < b.volume) return -1;
    if (a.volume > b.volume) return 1;
    return 0;
  });
});
</script>

<style scoped>
#grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
#list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media screen and (max-width: 768px) {
  #grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>