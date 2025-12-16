<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold">Books by Groups</h1>
        <Pulldown
          v-model="selectedGroupType"
          :options="[
            { label: 'Authors', value: 'authors' },
            { label: 'Publishers', value: 'publishers' },
            { label: 'Series', value: 'series' }
          ]"
          class="text-sm"
        />
      </div>
      <p class="text-gray-600 mb-4">Browse books organized by authors, publishers, and series</p>
      <SearchBar 
        v-model="searchQuery" 
        :placeholder="'Search groups...'"
        :show-search-type="false"
        @search="handleSearch"
      />
    </div>

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- グループ表示 -->
    <div v-else>
      <!-- 著者グループ -->
      <div v-if="selectedGroupType === 'authors'">
        <div class="mb-6 pb-3 border-b-2 border-blue-500">
          <h2 class="text-2xl font-bold text-gray-800">Authors</h2>
          <p class="text-sm text-gray-600 mt-1">{{ filteredAuthors.length }} author(s)</p>
        </div>
        <div v-if="filteredAuthors.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <GroupCard
            v-for="author in filteredAuthors"
            :key="author.id"
            :name="author.name"
            :book-count="author.bookCount"
            :books="author.books"
            button-class="text-blue-600 hover:text-blue-700"
            @click-card="viewGroupBooks('author', author.id, author.name)"
            @click-book="navigateToBook"
          />
        </div>
        <div v-else class="text-center py-8 bg-gray-50 rounded">
          <p class="text-gray-500">No authors found</p>
        </div>
      </div>

      <!-- 出版社グループ -->
      <div v-else-if="selectedGroupType === 'publishers'">
        <div class="mb-6 pb-3 border-b-2 border-green-500">
          <h2 class="text-2xl font-bold text-gray-800">Publishers</h2>
          <p class="text-sm text-gray-600 mt-1">{{ filteredPublishers.length }} publisher(s)</p>
        </div>
        <div v-if="filteredPublishers.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <GroupCard
            v-for="publisher in filteredPublishers"
            :key="publisher.id"
            :name="publisher.name"
            :book-count="publisher.bookCount"
            :books="publisher.books"
            button-class="text-green-600 hover:text-green-700"
            @click-card="viewGroupBooks('publisher', publisher.id, publisher.name)"
            @click-book="navigateToBook"
          />
        </div>
        <div v-else class="text-center py-8 bg-gray-50 rounded">
          <p class="text-gray-500">No publishers found</p>
        </div>
      </div>

      <!-- シリーズグループ -->
      <div v-else-if="selectedGroupType === 'series'">
        <div class="mb-6 pb-3 border-b-2 border-purple-500">
          <h2 class="text-2xl font-bold text-gray-800">Series</h2>
          <p class="text-sm text-gray-600 mt-1">{{ filteredSeries.length }} series(ies)</p>
        </div>
        <div v-if="filteredSeries.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <GroupCard
            v-for="s in filteredSeries"
            :key="s.id"
            :name="s.name"
            :book-count="s.bookCount"
            :books="s.books"
            button-class="text-purple-600 hover:text-purple-700"
            @click-card="viewGroupBooks('series', s.id, s.name)"
            @click-book="navigateToBook"
          />
        </div>
        <div v-else class="text-center py-8 bg-gray-50 rounded">
          <p class="text-gray-500">No series found</p>
        </div>
      </div>
    </div>

    <!-- 詳細モーダル -->
    <div v-if="selectedGroup && selectedBooks.length > 0" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="selectedGroup = null">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <!-- ヘッダー -->
        <div class="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4 flex items-center justify-between">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedGroup }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ selectedBooks.length }} book(s)</p>
          </div>
          <div class="flex items-center gap-3">
            <Pulldown
              v-model="displayFormat"
              :options="[
                { label: 'Cards', value: 'card' },
                { label: 'Compact List', value: 'compact' },
                { label: 'Full List', value: 'full' }
              ]"
              class="text-sm"
            />
            <button @click="selectedGroup = null" class="text-gray-500 hover:text-gray-700">
              <Icon name="close" size="24" />
            </button>
          </div>
        </div>

        <!-- 本一覧 -->
        <div class="px-6 py-4">
          <!-- カード表示 -->
          <div v-if="displayFormat === 'card'" class="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div
              v-for="book in selectedBooks"
              :key="book.id"
              class="border rounded p-3 hover:shadow-md transition cursor-pointer hover:bg-gray-50"
              @click="navigateToBook(book.id)"
            >
              <div class="flex gap-3">
                <img
                  v-if="book.coverUrl"
                  :src="book.coverUrl"
                  :alt="book.title"
                  class="w-16 h-20 object-cover rounded flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm truncate text-gray-800">{{ book.title }}</h4>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ book.authors?.[0]?.author?.name || 'Unknown Author' }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">Vol. {{ book.volume }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- コンパクトリスト表示 -->
          <div v-else-if="displayFormat === 'compact'" class="space-y-2">
            <div
              v-for="book in selectedBooks"
              :key="book.id"
              class="border rounded p-3 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
              @click="navigateToBook(book.id)"
            >
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm truncate text-gray-800">{{ book.title }}</h4>
              </div>
              <span class="text-xs text-gray-500 ml-2 flex-shrink-0">Vol. {{ book.volume }}</span>
            </div>
          </div>

          <!-- フルリスト表示 -->
          <div v-else-if="displayFormat === 'full'" class="divide-y">
            <div
              v-for="book in selectedBooks"
              :key="book.id"
              class="py-3 hover:bg-gray-50 transition cursor-pointer"
              @click="navigateToBook(book.id)"
            >
              <h4 class="font-medium text-gray-800">{{ book.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">
                {{ book.authors?.[0]?.author?.name || 'Unknown Author' }} • Vol. {{ book.volume }}
              </p>
              <p v-if="book.isbn" class="text-xs text-gray-500 mt-1">ISBN: {{ book.isbn }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/icons.vue';
import Pulldown from '@/components/ui/Pulldown.vue';
import SearchBar from '@/components/SearchBar.vue';
import GroupCard from '@/components/GroupCard.vue';

const router = useRouter();
const isLoading = ref(false);
const authors = ref([]);
const publishers = ref([]);
const series = ref([]);
const searchQuery = ref("");
const selectedGroup = ref<string | null>(null);
const selectedBooks = ref<any[]>([]);
const displayFormat = ref<'card' | 'compact' | 'full'>('compact');
const selectedGroupType = ref<'authors' | 'publishers' | 'series'>('authors');

const filteredAuthors = computed(() => {
  if (!searchQuery.value) return authors.value;
  const query = searchQuery.value.toLowerCase();
  return authors.value.filter(a => {
    // 著者名で検索
    if (a.name.toLowerCase().includes(query)) return true;
    
    // 著者の本のタイトルで検索
    if (a.books && a.books.length > 0) {
      return a.books.some(book => book.title.toLowerCase().includes(query));
    }
    
    return false;
  });
});

const filteredPublishers = computed(() => {
  if (!searchQuery.value) return publishers.value;
  const query = searchQuery.value.toLowerCase();
  return publishers.value.filter(p => {
    // 出版社名で検索
    if (p.name.toLowerCase().includes(query)) return true;
    
    // 出版社の本のタイトルで検索
    if (p.books && p.books.length > 0) {
      return p.books.some(book => book.title.toLowerCase().includes(query));
    }
    
    return false;
  });
});

const filteredSeries = computed(() => {
  if (!searchQuery.value) return series.value;
  const query = searchQuery.value.toLowerCase();
  return series.value.filter(s => {
    // シリーズ名で検索
    if (s.name.toLowerCase().includes(query)) return true;
    
    // シリーズの本のタイトルで検索
    if (s.books && s.books.length > 0) {
      return s.books.some(book => book.title.toLowerCase().includes(query));
    }
    
    return false;
  });
});

const handleSearch = ({ text }) => {
  searchQuery.value = text;
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/api/groups?includeBooks=true&limit=5');
    if (!response.ok) throw new Error('Failed to fetch groups');
    const result = await response.json();
    authors.value = result.authors;
    publishers.value = result.publishers;
    series.value = result.series;
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    isLoading.value = false;
  }
};

const viewGroupBooks = async (groupType: string, groupId: string, groupName: string) => {
  try {
    // 表示形式に応じて必要なフィールドを決定
    let fields = 'id,title,volume';
    if (displayFormat.value === 'card') {
      fields = 'id,title,volume,author,coverUrl';
    } else if (displayFormat.value === 'full') {
      fields = 'id,title,volume,author,isbn';
    }
    
    const response = await fetch(`/api/groups/${groupType}/${groupId}?fields=${fields}`);
    if (!response.ok) throw new Error('Failed to fetch group books');
    const result = await response.json();
    selectedGroup.value = groupName;
    selectedBooks.value = result.books;
  } catch (error) {
    console.error('Error fetching group books:', error);
  }
};

const navigateToBook = (bookId: string) => {
  router.push(`/books/${bookId}`);
  selectedGroup.value = null;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
