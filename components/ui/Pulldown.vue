<template>
  <div class="relative inline-block">
    <!-- トリガーボタン -->
    <button
      class="flex h-10 items-center justify-around rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
    >
      <slot name="prefix"></slot>
      <div v-if="showSelectedOption">
        <span v-if="selectedOption">{{ selectedOption.label }}</span>
        <span v-else class="text-muted-foreground">Select an option</span>
      </div>
      <slot name="suffix"></slot>
    </button>

    <!-- ドロップダウンメニュー -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-2 max-h-96 overflow-auto rounded-md border bg-white shadow-md"
      style=" width: 110px "
    >
      <ul>
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm hover:bg-gray-100"
        >
          <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Icon v-if="option.value === modelValue" name="check" size="20" class="text-muted-foreground" />
          </span>
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import Icon from "@/components/icons.vue";

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
  showSelectedOption: {
    type: Boolean,
    default: true, // デフォルトで選択されたオプションを表示
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>