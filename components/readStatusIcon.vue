<template>
<button :class="statusClass(status)">{{status}}</button>
</template>
<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});
const statusClass = (status) => {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
        case 'Completed':
            return `${baseClass} bg-green-100 text-green-800`
        case 'Reading':
            return `${baseClass} bg-blue-100 text-blue-800`
        case 'To Read':
            return `${baseClass} bg-yellow-100 text-yellow-800`
        default:
            return `${baseClass} bg-gray-100 text-gray-800`
    }
}
</script>