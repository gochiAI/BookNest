<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black/80"
        @click="close"
      ></div>

      <!-- Dialog Content -->
      <div
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg sm:rounded-lg"
      >
        <div class="flex flex-col space-y-4">
          <!-- Header -->
          <div v-if="$slots.header" class="text-center sm:text-left">
            <slot name="header" />
          </div>

          <!-- Description -->
          <div v-if="$slots.description" class="text-sm text-muted-foreground">
            <slot name="description" />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref } from "vue";

export default {
  name: "AlertDialog",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);

    const close = () => {
      emit("update:modelValue", false);
    };

    return {
      isOpen,
      close,
    };
  },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>