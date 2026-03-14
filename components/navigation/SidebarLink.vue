<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors',
      isActive && 'bg-blue-50 text-blue-600 font-medium',
    ]"
    @click="$emit('click')"
  >
    <Icon :name="icon" size="20" />
    <span class="text-sm font-medium">{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Icon from '@/components/icons.vue';

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['click']);
const route = useRoute();

const isActive = computed(() => {
  return route.path === props.to;
});
</script>

<style scoped>
/* スタイル */
</style>
