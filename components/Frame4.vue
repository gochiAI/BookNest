<template>
  <div class="flex justify-start items-center w-[790px] relative gap-14">
    <PullDown id="readStatus" :label="t('BookFilter.readStatusLabel')" :options="[
      { value: 'all', label: t('BookFilter.ReadStatus.All') },
      { value: '1', label: t('BookFilter.ReadStatus.Completed') },
      { value: '2', label: t('BookFilter.ReadStatus.Reading') },
      { value: '3', label: t('BookFilter.ReadStatus.Unread') }
    ]" :iconName="'my-icon:filter-alt'" @update:modelValue="updateFilter('readStatus', $event)" />
    <PullDown id="bookType" :label="t('BookFilter.bookTypeLabel')" :options="[
      { value: 'all', label: t('BookFilter.BookType.All') },
      { value: '1', label: t('BookFilter.BookType.General') },
      { value: '2', label: t('BookFilter.BookType.Manga') },
      { value: '3', label: t('BookFilter.BookType.LightNovel') },
      { value: '4', label: t('BookFilter.BookType.Other') }
    ]" :iconName="'my-icon:book-4'" @update:modelValue="updateFilter('bookType', $event)" />
    <Inputbox id="search" :label="t('BookFilter.searchLabel')" :iconName="'my-icon:search'"
      :placeholder="t('BookFilter.searchPlaceHolder')" @update:modelValue="updateFilter('search', $event)" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import PullDown from './Form/Pulldown.vue';
import Inputbox from './Form/InputBox.vue';

const props = defineProps({
  readStatus: {
    type: String,
    required: true,
    validator: (value) => ['all', '1', '2', '3'].includes(value),
    default: 'all'
  },
  bookType: {
    type: String,
    required: true,
    validator: (value) => ['all', '1', '2', '3', '4'].includes(value),
    default: 'all'
  },
  search: {
    type: String,
    required: true,
    validator: (value) => value.length <= 100,
    default: ''
  }
});

const emit = defineEmits(['update:readStatus', 'update:bookType', 'update:search']);

const updateFilter = (id, value) => {
  if (id === 'readStatus') {
    emit('update:readStatus', value);
  } else if (id === 'bookType') {
    emit('update:bookType', value);
  } else if (id === 'search') {
    emit('update:search', value);
  }
};
</script>