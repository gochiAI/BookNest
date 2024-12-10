<template>
<div class="btn btn-xs px-2 py-1 rounded-full text-xs font-medium" :class="statusClass(props.status)">
    {{ props.status }}
</div>
</template>
<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['Completed', 'Reading', 'To Read','Unread'].includes(value)
  },
});
const statusClass = (status) => {
    const baseClass = ''
    switch (status) {
        case 'Completed':
            return `${baseClass} bg-green-100 text-green-800`
        case 'Reading':
            return `${baseClass} bg-blue-100 text-blue-800`
        case 'To Read':
            return `${baseClass} bg-yellow-100 text-yellow-800`
        case 'Unread':
            return `${baseClass} bg-gray-100 text-gray-800`
        default:
            return `${baseClass} bg-gray-100 text-gray-800`
    }
}
</script>