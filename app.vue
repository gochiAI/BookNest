<template>
  <div class="container mx-auto px-4 py-8">
    <Frame4 :readStatus="readStatus" :bookType="bookType" :search="search" />
    <Frame5 />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Frame4 from './components/Frame4.vue';
import Frame5 from './components/Frame5.vue';


const readStatus = ref('all');
const bookType = ref('all');
const search = ref('');

</script>
