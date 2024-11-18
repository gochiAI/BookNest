<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Bookshelf</h1>

    <div class="mb-6 flex flex-wrap items-center justify-between">
      <DisplayOptions v-model="displayOption" />
      <BookFilter
        v-model:readStatus="readStatus"
        v-model:search="search"
        v-model:bookType="bookType"
      />
      <button
        @click="resetFilters"
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
      >
        Reset Filters
      </button>
    </div>
    <ul>
      <li v-for="book in books" :key="book.id">
        <div class="bg-white shadow-md rounded p-4 mb-4">
          <h2 class="text-xl font-bold">{{ book.title }}</h2>
          <p class="text-gray-600">{{ book.author }}</p>
          <p class="text-gray-600">{{ book.series }}</p>
          <p class="text-gray-600">{{ book.type }}</p>
          <p class="text-gray-600">{{ book.readStatus }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import DisplayOptions from "./components/DisplayOptions.vue";
import BookFilter from "./components/BookFilter.vue";

interface FilterState {
  displayOption: "all" | "author" | "series";
  readStatus: "all" | "read" | "reading" | "unread";
  bookType: "all" | "generalbook" | "novel" | "manga" | "other";
  search: string;
}
const displayOption = ref<FilterState["displayOption"]>("all");
const readStatus = ref<FilterState["readStatus"]>("all");
const bookType = ref<FilterState["bookType"]>("all");
const search = ref<FilterState["search"]>("");

const books = ref([]);

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

const fetchBooks = async () => {
  try {
    const response = await useFetch("/api/books/", {
      method: "GET",
    });
    console.log(response.data.value);

    books.value = response.data.value;
  } catch (error) {
    console.error(error);
  } finally {
    console.log("Fetching books completed");
  }
};

onMounted(fetchBooks);
</script>
