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
      > Reset Filters </button>
    </div>
  </div>
  <NuxtPage />
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

const handleFilterChange = () => {
  const currentState = {
    displayOption: displayOption.value,
    readStatus: readStatus.value,
    bookType: bookType.value,
    search: search.value,
  };
  localStorage.setItem("filterState", JSON.stringify(currentState));
};

watch(
  [displayOption, readStatus, bookType],
  () =>  handleFilterChange(),
  { deep: true }
);
watch(search, () => {
  useDebounceFn(() => handleFilterChange(), 500);
});
const resetFilters = () => {
  displayOption.value = "all";
  readStatus.value = "all";
  bookType.value = "all";
  search.value = "";
};
</script>
