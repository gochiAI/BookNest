<template>
  <div>
    <div class="flex justify-start items-center w-[75w] relative lg:gap-14">
      <!-- 読書状況のプルダウン -->
      <PullDown
        id="readStatus"
        :label="t('BookFilter.readStatusLabel')"
        :options="readStatusOptions"
        :iconName="'my-icon:filter-alt'"
        @update:modelValue="updateFilter('readStatus', $event)"
      />
      <!-- 書籍タイプのプルダウン -->
      <PullDown
        id="bookType"
        :label="t('BookFilter.bookTypeLabel')"
        :options="bookTypeOptions"
        :iconName="'my-icon:book-4'"
        @update:modelValue="updateFilter('bookType', $event)"
      />
      <!-- 検索ボックス -->
      <Inputbox
        id="search"
        :label="t('BookFilter.searchLabel')"
        :iconName="'my-icon:search'"
        :placeholder="t('BookFilter.searchPlaceHolder')"
        @update:modelValue="updateFilter('search', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PullDown from './Form/Pulldown.vue';
import Inputbox from './Form/InputBox.vue';
import { getBookTypeOptions, getReadStatusOptions } from '../config/bookOptions';

const { t } = useI18n();

const filters = ref({
  readStatus: 'all',
  bookType: 'all',
  search: ''
});

// 動的にオプションを取得
const bookTypeOptions = getBookTypeOptions(t);
const readStatusOptions = getReadStatusOptions(t);

const updateFilter = (key, value) => {
  filters.value[key] = value;
  // 親コンポーネントに値を伝播
  emit(`update:${key}`, value);
};
</script>