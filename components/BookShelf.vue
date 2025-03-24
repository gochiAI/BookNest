<template>
  <div>
    <div id="header">
      <Pulldown
        id="readStatus"
        :label="t('BookFilter.readStatusLabel')"
        :options="readStatusOptions"
        @input="updateFilter('readStatus', $event)"
      />
      <Pulldown
        id="bookType"
        :label="t('BookFilter.bookTypeLabel')"
        :options="bookTypeOptions"
        @input="updateFilter('bookType', $event)"
      />
      <Inputbox
        id="search"
        :label="t('BookFilter.searchLabel')"
        :iconName="'my-icon:search'"
        :placeholder="t('BookFilter.searchPlaceHolder')"
        v-model="filters.search"
      />
    </div>
    <div v-if="displayOption === 'grid'" id="grid">
      <CardBook v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>
    <div v-else id="list">
      <ListBook v-for="book in sortedBooks" :key="book.id" :book="book" />
    </div>

    <!-- ページネーション -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }}</span>
      <button @click="nextPage" :disabled="books.length < itemsPerPage">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import CardBook from './CardBook.vue';
import ListBook from './ListBook.vue';
import Pulldown from './Form/Pulldown.vue';
import Inputbox from './Form/InputBox.vue';
import { getBookTypeOptions, getReadStatusOptions } from '../config/bookOptions';

const { t } = useI18n();

const books = ref([]);
const currentPage = ref(1); // 現在のページ番号
const itemsPerPage = 15; // 1ページあたりのアイテム数

const filters = ref({
  readStatus: 'all',
  bookType: 'all',
  search: '',
});

const readStatusOptions = getReadStatusOptions(t);
const bookTypeOptions = getBookTypeOptions(t);

const updateFilter = (key, value) => {
  filters.value[key] = value;
  fetchBooks();
};

const fetchBooks = async () => {
  try {
    const params = {
      ...filters.value,
      page: currentPage.value,
      itemsPerPage,
    };

    if (filters.value.readStatus === 'all') delete params.readStatus;
    if (filters.value.bookType === 'all') delete params.bookType;

    const response = await $fetch('/api/bookSearch', { params });
    books.value = response.books || [];
  } catch (error) {
    console.error('Error fetching books:', error);
  }
};

// ページネーションの操作
const nextPage = () => {
  currentPage.value++;
  fetchBooks();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchBooks();
  }
};

// データのソート
const sortedBooks = computed(() => {
  return books.value.slice().sort((a, b) => {
    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
    if (a.volume < b.volume) return -1;
    if (a.volume > b.volume) return 1;
    return 0;
  });
});

// 初期データの取得
fetchBooks();

// filters.search を監視して fetchBooks を呼び出す
watch(
  () => filters.value.search,
  () => {
    currentPage.value = 1; // 検索時にページ番号をリセット
    fetchBooks();
  }
);
</script>

<style scoped>
#header {
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 1022px) {
  #header {
    flex-direction: column;
    align-items: flex-start;
    background-color: #D9D9D9;
  }
}
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>