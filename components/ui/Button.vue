<template>
  <button :class="buttonClass" :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import clsx from 'clsx'; // clsxをインポート

// Propsの定義
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// Emitsの定義
const emit = defineEmits(['click']);

// ボタンのサイズとスタイルを定義
const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const variantClasses = {
  default: 'bg-gray-300 text-black hover:bg-gray-400',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-gray-300 bg-white hover:bg-gray-100',
  secondary: 'bg-blue-500 text-white hover:bg-blue-600',
  ghost: 'hover:bg-gray-100 text-gray-700',
  link: 'text-blue-500 underline hover:text-blue-600',
};

// Computedプロパティでクラスを生成
const buttonClass = computed(() =>
  clsx(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[props.size],
    variantClasses[props.variant],
    { 'cursor-not-allowed': props.disabled }
  )
);

// クリックイベントハンドラ
const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>