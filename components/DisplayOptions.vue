<template>
  <div class="flex flex-col" role="group" aria-label="表示オプション">
    <button
      v-for="{ value, label } in options"
      :key="value"
      type="button"
      class="px-4 py-2 text-sm font-medium border"
      :aria-pressed="modelValue === value"
      :class="{
        'bg-white text-gray-700 hover:bg-gray-50': modelValue !== value,
        'bg-indigo-600 text-white': modelValue === value,
      }"
      @click="$emit('update:modelValue', value)"
    >
      {{ label }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = [
  { value: "all", label: t("DisplayOptions.All") },
  { value: "author", label: t("DisplayOptions.Author") },
  { value: "series", label: t("DisplayOptions.Series") },
];
</script>
