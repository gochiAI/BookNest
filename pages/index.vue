<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">BookNest - 書籍一覧</h1>
    <div class="w-full flex flex-wrap gap-4 mb-4 justify-between">
      <div class="flex gap-4">
        <FilterBar v-model:book-type="filters.bookType" v-model:read-status="filters.readStatus" />
        <SearchBar v-model="filters.search" />
      </div>
      <OptionsBar v-model:sort-option="sortOption" v-model:layout="layout" />
    </div>

    <BookShelf :books="sortedBooks" :layout="layout" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import BookShelf from "@/components/BookShelf.vue";
import SearchBar from "@/components/SearchBar.vue";
import FilterBar from "@/components/FilterBar.vue";
import OptionsBar from "@/components/OptionsBar.vue";

const currentPage = ref(1); // 現在のページ番号
const itemsPerPage = 6; // 1ページあたりのアイテム数

// layoutの定義

const filters = ref({
  readStatus: "",
  bookType: "",
  search: "",
});

// ソートとレイアウトの状態
const sortOption = ref("title-asc");
const layout = ref("grid");

// 動的にURLを計算
const apiUrl = computed(() => {
  const params = new URLSearchParams({
    ...filters.value,
    page: currentPage.value.toString(),
    itemsPerPage: itemsPerPage.toString(),
  });
  return `/api/bookSearch?${params.toString()}`;
});

// useFetchで計算されたURLを使用
const { data, error, pending, refresh } = useFetch(apiUrl, {
  watch: [filters, currentPage],
  immediate: true,
});

const fetchedBooks = computed(() => {
  // データが存在しない場合は空の配列を返す
  return data.value?.data?.books || [];
});

const sortedBooks = computed(() => {
  if (!fetchedBooks.value) return [];
  // ソートオプションに基づいて書籍をソート
  const books = [...fetchedBooks.value];
  if (sortOption.value === "title-asc") {
    return books.sort((a, b) => {
      const titleComparison = a.title.localeCompare(b.title);
      if (titleComparison !== 0) return titleComparison;
      return (a.volume || 0) - (b.volume || 0); // volumeで昇順
    });
  } else if (sortOption.value === "title-desc") {
    return books.sort((a, b) => {
      const titleComparison = b.title.localeCompare(a.title);
      if (titleComparison !== 0) return titleComparison;
      return (b.volume || 0) - (a.volume || 0); // volumeで降順
    });
  } else if (sortOption.value === "date-asc") {
    return books.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  } else if (sortOption.value === "date-desc") {
    return books.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }
  return books;
});

</script>

<style scoped>
.container {
  max-width: 800px;
}

.flex {
  display: flex;
}

.gap-4 {
  gap: 1rem;
  /* Tailwind CSSのgapユーティリティ */
}

.mb-4 {
  margin-bottom: 1rem;
  /* Tailwind CSSのmargin-bottomユーティリティ */
}
</style>