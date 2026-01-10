<template>
  <div class="flex h-screen bg-gray-50">
    <!-- モバイルオーバーレイ -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
      @click="toggleSidebar"
    />

    <!-- サイドパネル -->
    <aside
      :class="[
        'fixed md:sticky z-50 h-screen w-64 bg-white border-r shadow-lg md:shadow-none transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden',
      ]"
    >
      <!-- ヘッダー -->
      <div class="p-6 border-b relative">
        <h2 class="text-xl font-bold">BookNest</h2>
        <button
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors"
          @click="toggleSidebar"
        >
          <Icon name="close" size="24" />
        </button>
      </div>

      <!-- ナビゲーションメニュー -->
      <nav class="p-4 space-y-2">
        <SidebarLink
          to="/"
          :icon="'home'"
          label="Home"
          @click="closeSidebar"
        />
        <SidebarLink
          to="/collections"
          :icon="'library'"
          label="Collections"
          @click="closeSidebar"
        />
        <SidebarLink
          to="/groups"
          :icon="'layers'"
          label="Groups"
          @click="closeSidebar"
        />

        <!-- 区切り線 -->
        <div class="my-4 border-t" />

        <!-- その他のメニュー -->
        <SidebarLink
          to="/statistics"
          :icon="'barChart2'"
          label="Statistics"
          @click="closeSidebar"
        />
        <SidebarLink
          to="/upload"
          :icon="'upload'"
          label="Upload Books"
          @click="closeSidebar"
        />
        <SidebarLink
          to="/about"
          :icon="'info'"
          label="About"
          @click="closeSidebar"
        />

        <!-- 区切り線 -->
        <div class="my-4 border-t" />

        <!-- 設定 -->
        <SidebarLink
          to="/settings"
          :icon="'settings'"
          label="Settings"
          @click="closeSidebar"
        />
      </nav>

      <!-- フッター -->
      <div class="absolute bottom-0 w-full p-4 border-t bg-gray-50">
        <Button
          variant="secondary"
          class="w-full"
          @click="handleNewBook"
        >
          <Icon name="add" size="20" class="mr-2" />
          New Book
        </Button>
      </div>
    </aside>

    <!-- メインコンテンツ -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- トップバー -->
      <header class="bg-white border-b shadow-sm">
        <div class="px-4 py-4 flex items-center justify-between">
          <button
            class="text-gray-600 hover:text-gray-900 transition-colors"
            @click="toggleSidebar"
          >
            <Icon name="menu" size="24" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900 flex-1 md:hidden">BookNest</h1>
        </div>
      </header>

      <!-- ページコンテンツ -->
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-4 py-8">
          <NuxtPage />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/icons.vue';
import Button from '@/components/ui/Button.vue';
import SidebarLink from '@/components/navigation/SidebarLink.vue';

const router = useRouter();
const isOpen = ref(false);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const closeSidebar = () => {
  isOpen.value = false;
};

const handleNewBook = () => {
  sessionStorage.removeItem('x-book-id');
  router.push('/new');
  closeSidebar();
};
</script>
