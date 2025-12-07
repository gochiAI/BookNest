<template>
  <div class="border rounded-lg overflow-hidden hover:shadow-lg transition bg-white">
    <!-- ヘッダー -->
    <div class="px-4 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
      <h3 class="font-bold text-lg text-gray-800">{{ title }}</h3>
      <p class="text-sm text-gray-600 mt-1">{{ items.length }} item(s)</p>
    </div>

    <!-- コンテンツ -->
    <div class="p-4 space-y-3 max-h-80 overflow-y-auto">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-blue-50 transition"
      >
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm text-gray-800 truncate">{{ item.name }}</h4>
          <p class="text-xs text-gray-600 mt-1">{{ item.bookCount }} book(s)</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="$emit('view-group', item.id)"
          class="text-xs ml-3 flex-shrink-0"
        >
          <Icon name="right" size="14" class="mr-1" />
          View
        </Button>
      </div>

      <!-- アイテムがない場合 -->
      <div v-if="items.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-sm">No items</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
});

defineEmits(['view-group']);
</script>

<style scoped>
/* スタイル */
</style>
