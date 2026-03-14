<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black/80"
        @click="$emit('update:modelValue', false)"
      ></div>

      <!-- Dialog Content -->
      <div
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg sm:rounded-lg"
      >
        <div class="flex flex-col space-y-4">
          <!-- Header/Title -->
          <div v-if="$slots.title" class="text-lg font-semibold">
            <slot name="title" />
          </div>

          <!-- Content -->
          <div v-if="$slots.content" class="space-y-4">
            <slot name="content" />
          </div>

          <!-- Actions/Footer -->
          <div v-if="$slots.actions" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* スタイル */
</style>