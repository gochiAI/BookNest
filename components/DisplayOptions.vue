<template>
    <div class="flex  flex-col " role="group">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="px-4 py-2 text-sm font-medium border"
        :class="{
          'bg-white text-gray-700 hover:bg-gray-50': modelValue !== option.value,
          'bg-indigo-600 text-white': modelValue === option.value
        }"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import {useI18n} from 'vue-i18n';
  const { t } = useI18n();
  const props = defineProps({
    modelValue: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['update:modelValue']);

  const options = [
    { value: 'all', label: t('DisplayOptions.All') },
    { value: 'author', label: t('DisplayOptions.Author') },
    { value: 'series', label: t('DisplayOptions.Series') }
  ]
  </script>