<template>
  <div class="flex flex-wrap gap-4">
    <div class="flex-grow" v-for="filter in filters" :key="filter.id">
      <label :for="filter.id" class="block text-sm font-medium text-gray-700">{{ filter.label }}</label>
      <select
        v-if="filter.type === 'select'"
        :id="filter.id"
        :value="$props[filter.id]"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        @change="$emit(`update:${filter.id}`, $event.target.value)"
      >
        <option v-for="option in filter.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <input
        v-else
        :id="filter.id"
        :value="$props[filter.id]"
        :type="filter.type"
        :placeholder="filter.placeholder"
        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        @input="$emit(`update:${filter.id}`, $event.target.value)"
      >
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  readStatus: {
    type: String,
    required: true,
  },
  bookType: {
    type: String,
    required: true,
  },
  search: {
    type: String,
    required: true
  }
})

defineEmits(['update:readStatus', 'update:bookType', 'update:search'])
const filters = [
  {
    id: 'readStatus',
    label: t('BookFilter.ReadStatuslabel'),
    type: 'select',
    options: [
      { value: 'all', label: t('BookFilter.ReadStatus.All') },
      { value: 'read', label: t('BookFilter.ReadStatus.Read') },
      { value: 'reading', label: t('BookFilter.ReadStatus.Reading') },
      { value: 'unread', label: t('BookFilter.ReadStatus.Unread') }
    ]
  },
  {
    id: 'bookType',
    label: t('BookFilter.BookTypelabel'),
    type: 'select',
    options: [
      { value: 'all', label: t('BookFilter.BookType.All') },
      { value: '1', label: t('BookFilter.BookType.GeneralBooks') },
      { value: '2', label: t('BookFilter.BookType.Manga') },
      { value: '3', label: t('BookFilter.BookType.LightNovel') },
      { value: '4', label: t('BookFilter.BookType.Other') }
    ]
  },
  {
    id: 'search',
    label: t('BookFilter.Searchlabel'),
    type: 'text',
    placeholder: t('BookFilter.SearchPlaceholder')
  }
]
</script>