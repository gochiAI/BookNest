<template>
<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Bookshelf</h1>
    
    <div class="mb-6 flex flex-wrap items-center justify-between">
      <DisplayOptions v-model="displayOption" />
      <BookFilter v-model:readStatus="readStatus" v-model:search="search" v-model:bookType="bookType" />
    </div>
  </div>
  <NuxtPage />
</template>

<script setup>
import { ref, watch } from 'vue'
import DisplayOptions from './components/DisplayOptions.vue'
import BookFilter from './components/BookFilter.vue'
const displayOption = ref('all')
const readStatus = ref('all')
const bookType = ref('all')
const search = ref('')

watch(displayOption, (newValue) => {
  console.log('displayOption:', newValue)
})
watch(readStatus, (newValue) => {
  console.log('readStatus:', newValue)
})

watch(bookType, (newValue) => {
  console.log('bookType:', newValue)
})

watch(search, (newValue) => {
  console.log('search:', newValue)
})

</script>
