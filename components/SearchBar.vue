<template>
  <div class="flex gap-2 m-[0.5rem]">
    <div class="relative flex-1">
      <input
        type="text"
        :placeholder="placeholder"
        v-model="searchText"
        @input="onSearchInput"
        @keyup.enter="onSearch"
        class="pl-10 pr-4 py-2 rounded-md shadow-sm outline outline-2 focus:outline-red-500 w-full"
      />
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="search" size="20" class="text-muted-foreground" />
      </div>
    </div>
    <select
      v-if="showSearchType"
      v-model="searchType"
      @change="onSearchTypeChange"
      class="px-3 py-2 rounded-md shadow-sm outline outline-2 focus:outline-red-500 bg-white"
    >
      <option value="title">Title</option>
      <option value="author">Author</option>
      <option value="tag">Tag</option>
      <option value="all">All</option>
    </select>
    <button
      v-if="searchText"
      @click="clearSearch"
      class="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
    >
      <Icon name="close" size="20" />
    </button>
  </div>
</template>
<script setup>
import Icon from "@/components/icons.vue";
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search books...'
  },
  showSearchType: {
    type: Boolean,
    default: true
  },
  initialSearchType: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['update:modelValue', 'search', 'searchTypeChange']);

const searchText = ref(props.modelValue);
const searchType = ref(props.initialSearchType);

watch(() => props.modelValue, (newVal) => {
  searchText.value = newVal;
});

const onSearchInput = () => {
  emit('update:modelValue', searchText.value);
};

const onSearch = () => {
  emit('search', { text: searchText.value, type: searchType.value });
};

const onSearchTypeChange = () => {
  emit('searchTypeChange', searchType.value);
  if (searchText.value) {
    onSearch();
  }
};

const clearSearch = () => {
  searchText.value = '';
  emit('update:modelValue', '');
  emit('search', { text: '', type: searchType.value });
};

</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>