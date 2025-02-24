<template>
  <button :class="buttonClass" :disabled="disabled" @click="handleClick">
    <template v-if="props.type === 'icon'">
      <Icon :name="iconName" :style="{ color: iconColor, fontSize: iconSize }" />
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  iconName: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: '#000',
  },
  iconSize: {
    type: String,
    default: '16px', // デフォルトのアイコンサイズを指定
  }
});

const emit = defineEmits(['click']);

const buttonClass = computed(() => {
  return {
    'text-base cursor-pointer border-none rounded': true,
    'bg-gray-300 text-black': props.type === 'default',
    'bg-transparent p-1 flex items-center justify-center': props.type === 'icon',
    'hover:bg-gray-200': props.type === 'icon' && !props.disabled,
    'cursor-not-allowed opacity-65': props.disabled,
  };
});

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>