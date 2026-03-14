<template>
  <div :class="['rounded-lg shadow p-6 border-l-4 bg-gradient-to-br', colorClasses]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600 mb-1">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-800">{{ value }}</p>
      </div>
      <div :class="['p-3 rounded-lg', iconBgColor]">
        <Icon :name="icon" size="24" :class="iconColor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/icons.vue';

const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'orange', 'red', 'pink'].includes(value),
  },
});

const colorMap = {
  blue: {
    border: 'border-blue-500',
    from: 'from-blue-50',
    to: 'to-blue-100',
  },
  green: {
    border: 'border-green-500',
    from: 'from-green-50',
    to: 'to-green-100',
  },
  purple: {
    border: 'border-purple-500',
    from: 'from-purple-50',
    to: 'to-purple-100',
  },
  orange: {
    border: 'border-orange-500',
    from: 'from-orange-50',
    to: 'to-orange-100',
  },
  red: {
    border: 'border-red-500',
    from: 'from-red-50',
    to: 'to-red-100',
  },
  pink: {
    border: 'border-pink-500',
    from: 'from-pink-50',
    to: 'to-pink-100',
  },
};

const iconBgMap = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  pink: 'bg-pink-100',
};

const iconColorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  pink: 'text-pink-600',
};

const colorClasses = `${colorMap[props.color].border} ${colorMap[props.color].from} ${colorMap[props.color].to}`;
const iconBgColor = iconBgMap[props.color];
const iconColor = iconColorMap[props.color];
</script>
