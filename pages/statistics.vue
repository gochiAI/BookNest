<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <h1 class="text-4xl font-bold mb-2">Statistics</h1>
      <p class="text-gray-600">Your book collection insights</p>
    </div>

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading statistics...</p>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- 統計データ表示 -->
    <div v-else class="space-y-8">
      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          :value="stats.summary.totalBooks"
          label="Total Books"
          icon="book"
          color="blue"
        />
        <StatCard
          :value="stats.summary.totalCollections"
          label="Collections"
          icon="library"
          color="green"
        />
        <StatCard
          :value="stats.summary.totalAuthors"
          label="Authors"
          icon="users"
          color="purple"
        />
        <StatCard
          :value="stats.summary.totalPublishers"
          label="Publishers"
          icon="building2"
          color="orange"
        />
      </div>

      <!-- 詳細統計グリッド -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 基本情報 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="info" size="20" />
            Basic Information
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Tags</span>
              <span class="font-semibold">{{ stats.summary.totalTags }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Series</span>
              <span class="font-semibold">{{ stats.summary.totalSeries }}</span>
            </div>
            <div class="flex justify-between border-t pt-3">
              <span class="text-gray-600">Books per Collection</span>
              <span class="font-semibold">{{ stats.average.booksPerCollection }}</span>
            </div>
          </div>
        </div>

        <!-- トップアイテム -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="award" size="20" />
            Top Items
          </h3>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-gray-500 uppercase tracking-wide">Top Author</p>
              <p class="font-semibold text-lg">{{ stats.topItems.author || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 uppercase tracking-wide">Top Publisher</p>
              <p class="font-semibold text-lg">{{ stats.topItems.publisher || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 uppercase tracking-wide">Top Series</p>
              <p class="font-semibold text-lg">{{ stats.topItems.series || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 巻数とページ数 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 巻数統計 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="layers" size="20" />
            Volume Statistics
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Minimum Volume</span>
              <span class="font-semibold">{{ stats.volume.min }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Maximum Volume</span>
              <span class="font-semibold">{{ stats.volume.max }}</span>
            </div>
            <div class="flex justify-between border-t pt-3">
              <span class="text-gray-600">Average Volume</span>
              <span class="font-semibold">{{ stats.volume.avg }}</span>
            </div>
          </div>
        </div>

        <!-- ページ数統計 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="fileText" size="20" />
            Page Statistics
          </h3>
          <div v-if="stats.pageNumber" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Minimum Pages</span>
              <span class="font-semibold">{{ stats.pageNumber.min }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Maximum Pages</span>
              <span class="font-semibold">{{ stats.pageNumber.max }}</span>
            </div>
            <div class="flex justify-between border-t pt-3">
              <span class="text-gray-600">Average Pages</span>
              <span class="font-semibold">{{ stats.pageNumber.avg }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-4">
            No page data available
          </div>
        </div>
      </div>

      <!-- 出版年 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon name="calendar" size="20" />
          Publication Year Range
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500 uppercase tracking-wide">Oldest Book</p>
            <p class="text-2xl font-bold">{{ stats.publishYear.oldest || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 uppercase tracking-wide">Newest Book</p>
            <p class="text-2xl font-bold">{{ stats.publishYear.newest || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- 分布チャート -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 出版社別分布 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="barChart2" size="20" />
            Distribution by Publisher
          </h3>
          <div class="space-y-3">
            <div v-for="(publisher, idx) in stats.distributionByPublisher" :key="idx" class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm truncate">{{ publisher.name }}</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    :style="{ width: publisher.percentage + '%' }"
                  />
                </div>
              </div>
              <div class="ml-4 text-right flex-shrink-0">
                <p class="font-semibold text-sm">{{ publisher.count }}</p>
                <p class="text-xs text-gray-500">{{ publisher.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- シリーズ別分布 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="barChart2" size="20" />
            Distribution by Series
          </h3>
          <div class="space-y-3">
            <div v-for="(s, idx) in stats.distributionBySeries" :key="idx" class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm truncate">{{ s.name }}</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                    :style="{ width: s.percentage + '%' }"
                  />
                </div>
              </div>
              <div class="ml-4 text-right flex-shrink-0">
                <p class="font-semibold text-sm">{{ s.count }}</p>
                <p class="text-xs text-gray-500">{{ s.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Icon from '@/components/icons.vue';
import StatCard from '@/components/ui/StatCard.vue';

const isLoading = ref(false);
const error = ref(null);
const stats = ref({
  summary: {
    totalBooks: 0,
    totalCollections: 0,
    totalTags: 0,
    totalAuthors: 0,
    totalPublishers: 0,
    totalSeries: 0,
  },
  average: {
    booksPerCollection: 0,
  },
  topItems: {
    author: null,
    publisher: null,
    series: null,
  },
  volume: {
    min: 0,
    max: 0,
    avg: 0,
  },
  publishYear: {
    oldest: null,
    newest: null,
  },
  pageNumber: null,
  distributionByPublisher: [],
  distributionBySeries: [],
});

const loadStatistics = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetch('/api/statistics');
    if (!response.ok) throw new Error('Failed to load statistics');
    stats.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error loading statistics:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStatistics();
});
</script>
