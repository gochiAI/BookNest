<template>
  <div class="flex items-center gap-1">
    <!-- ソートボタン -->
    <Pulldown
      :options="sortOptions"
      v-model="selectedSortOption"
      :show-selected-option="false"
    >
      <template #prefix>
        <Icon name="sort" size="20" class="text-muted-foreground" />
      </template>
    </Pulldown>
    <!-- レイアウトボタン -->
    <Pulldown
      :options="layoutOptions"
      v-model="selectedLayoutOption"
      :show-selected-option="false"
    >
      <template #prefix>
        <Icon name="layout-grid" size="20" class="text-muted-foreground" />
      </template>
    </Pulldown>
    <!-- 新規登録ボタン -->
    <Button variant="outline" size="sm" @click="handleNewBook">
      <Icon name="add" size="20" class="text-muted-foreground" />
    </Button>
  </div>
</template>

<script setup>
import { ref, defineModel } from "vue";
import Pulldown from "@/components/ui/Pulldown.vue";
import Icon from "@/components/icons.vue";
import Button from "@/components/ui/Button.vue";

// ソートオプション
const sortOptions = [
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
  { label: "Release Date (Newest)", value: "date-desc" },
  { label: "Release Date (Oldest)", value: "date-asc" },
];

// レイアウトオプション
const layoutOptions = [
  { label: "Grid", value: "grid" },
  { label: "List", value: "list" },
];

// 選択されたソートオプションとレイアウトオプション
const selectedSortOption = defineModel("sortOption");
const selectedLayoutOption = defineModel("layout");

// 新規登録ボタンのクリック処理
const handleNewBook = () => {
  const router = useRouter();
  sessionStorage.removeItem('x-book-id');
  router.push("/new");
  
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>