<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Bookshelf</h1>
    <label class="flex cursor-pointer gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
  <input type="checkbox" value="synthwave" class="toggle theme-controller" />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</label>

    <div class="flex mb-6 items-center justify-between">
      <DisplayOptions v-model="displayOption"/>
      <BookFilter
        v-model:readStatus="readStatus"
        v-model:search="search"
        v-model:bookType="bookType"
      />
      <button
        @click="resetFilters"
        class="btn bg-blue-200 hover:bg-gray-300 text-gray-800 font-bold py-2 p-4 m-4 rounded"
      
      >
        Reset Filters
      </button>
      <button class="btn" onclick="document.getElementById('my_modal_1').show()">open modal</button>
      <RegisterBook />
    </div>
    <NuxtLayout>
      <BookGrid v-if="thumbnailSize === 'grid'" :books="books" />
      <BookList v-else :books="books" />
    </NuxtLayout>
  </div>
  <NuxtPage />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import DisplayOptions from "./components/DisplayOptions.vue";
import BookFilter from "./components/BookFilter.vue";
import RegisterBook from "./components/RegisterBook.vue";
import BookGrid from "./layouts/BookGrid.vue";
import BookList from "./layouts/BookList.vue";

interface FilterState {
  displayOption: "all" | "author" | "series";
  readStatus: "all" | "completed" | "reading" | "unread";
  bookType: "all" | "generalbook" | "novel" | "manga" | "other";
  search: string;
}
const displayOption = ref<FilterState["displayOption"]>("all");
const readStatus = ref<FilterState["readStatus"]>("all");
const bookType = ref<FilterState["bookType"]>("all");
const search = ref<FilterState["search"]>("");
const thumbnailSize = ref("grid");

interface Book {
  id: number;
  title: string;
  releaseDate: string | null;
  cover: string | null;
  volume: number | null;
  isbn: string | null;
  author: { id: number; name: string };
  publisher: { id: number; name: string };
  series: { id: number; name: string } | null;
  bookType: { id: number; name: string };
  readStatus: { id: number; name: string };
}

const books = ref<Array<Book>>([]);

const handleFilterChange = () => {
  const currentState = {
    displayOption: displayOption.value,
    readStatus: readStatus.value,
    bookType: bookType.value,
    search: search.value,
  };
  localStorage.setItem("filterState", JSON.stringify(currentState));
};

watch([displayOption, readStatus, bookType], () => handleFilterChange(), {
  deep: true,
});
watch(search, () => {
  useDebounceFn(() => handleFilterChange(), 500);
});
const resetFilters = () => {
  displayOption.value = "all";
  readStatus.value = "all";
  bookType.value = "all";
  search.value = "";
};
const isLoading = ref(false);
const error = ref<string | null>(null);
const fetchBooks = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetch("/api/books");
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    books.value = await response.json();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchBooks);
</script>
