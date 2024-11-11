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
    </div>
  </div>
  <NuxtPage />
</template>

<script setup lang="ts">
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

</script>
