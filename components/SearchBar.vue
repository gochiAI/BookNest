<template>
  <div class="relative m-[0.5rem]">
    <input
      type="text"
      placeholder="Search books..."
      v-model="model"
      class="pl-10 pr-4 py-2 rounded-md shadow-sm outline outline-2 focus:outline-red-500 w-full sm:w-[300px] md:w-[400px]"
    />
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Icon name="search" size="20" class="text-muted-foreground" />
    </div>
  </div>
</template>
<script setup>
import Icon from "@/components/icons.vue";
const model = defineModel()

</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>