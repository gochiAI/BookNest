<template>
  <Card>
    <template #header>
      <div>
        <h3 class="text-lg font-bold">{{ collection.name }}</h3>
        <p v-if="collection.description" class="text-sm text-muted-foreground">
          {{ collection.description }}
        </p>
      </div>
    </template>
    <template #header-action>
      <div class="flex gap-2">
        <Button variant="ghost" size="icon" @click="$emit('edit', collection)">
          <Icon name="edit" size="20" />
        </Button>
        <Button variant="ghost" size="icon" @click="$emit('delete', collection.id)">
          <Icon name="trash" size="20" />
        </Button>
      </div>
    </template>
    <template #content>
      <div class="text-sm text-gray-600">
        <p>{{ bookCount }} book(s) in this collection</p>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';

const props = defineProps({
  collection: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete']);

const bookCount = computed(() => {
  return props.collection._count?.books || 0;
});
</script>

<style scoped>
/* スタイル */
</style>
