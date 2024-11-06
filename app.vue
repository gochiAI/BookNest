<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Bookshelf</h1>
    
    <div class="mb-6 flex flex-wrap items-center justify-between">
      <DisplayOptions v-model="displayOption" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DisplayOptions from './components/DisplayOptions.vue'


const displayOption = ref('all')
const thumbnailSize = ref('grid')
const filterStatus = ref('all')
const searchQuery = ref('')
</script>