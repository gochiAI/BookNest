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
          <div
            v-for="author in filteredAuthors"
            :key="author.id"
            class="border rounded-lg p-4 bg-white hover:shadow-lg transition cursor-pointer"
            @click="viewGroupBooks('author', author.id, author.name)"
          >
            <h3 class="font-bold text-lg text-gray-800 mb-3">{{ author.name }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ author.bookCount }} book(s)</p>
            <div v-if="author.books && author.books.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              <div 
                v-for="book in author.books" 
                :key="book.id" 
                class="relative group"
              >
                <img
                  v-if="book.coverUrl"
                  :src="book.coverUrl"
                  :alt="book.title"
                  class="w-full aspect-[2/3] object-cover rounded shadow-sm"
                />
                <div v-else class="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
                  <Icon name="library" size="24" class="text-gray-400" />
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded flex items-end p-1">
                  <p class="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition">{{ book.title }}</p>
                </div>
              </div>
            </div>
            <button class="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
              → View All Books
            </button>
          </div>
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
          <div
            v-for="publisher in filteredPublishers"
            :key="publisher.id"
            class="border rounded-lg p-4 bg-white hover:shadow-lg transition cursor-pointer"
            @click="viewGroupBooks('publisher', publisher.id, publisher.name)"
          >
            <h3 class="font-bold text-lg text-gray-800 mb-3">{{ publisher.name }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ publisher.bookCount }} book(s)</p>
            <div v-if="publisher.books && publisher.books.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              <div 
                v-for="book in publisher.books" 
                :key="book.id" 
                class="relative group"
              >
                <img
                  v-if="book.coverUrl"
                  :src="book.coverUrl"
                  :alt="book.title"
                  class="w-full aspect-[2/3] object-cover rounded shadow-sm"
                />
                <div v-else class="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
                  <Icon name="library" size="24" class="text-gray-400" />
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded flex items-end p-1">
                  <p class="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition">{{ book.title }}</p>
                </div>
              </div>
            </div>
            <button class="w-full text-green-600 hover:text-green-700 text-sm font-medium">
              → View All Books
            </button>
          </div>
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
          <div
            v-for="s in filteredSeries"
            :key="s.id"
            class="border rounded-lg p-4 bg-white hover:shadow-lg transition cursor-pointer"
            @click="viewGroupBooks('series', s.id, s.name)"
          >
            <h3 class="font-bold text-lg text-gray-800 mb-3">{{ s.name }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ s.bookCount }} book(s)</p>
            <div v-if="s.books && s.books.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              <div 
                v-for="book in s.books" 
                :key="book.id" 
                class="relative group"
              >
                <img
                  v-if="book.coverUrl"
                  :src="book.coverUrl"
                  :alt="book.title"
                  class="w-full aspect-[2/3] object-cover rounded shadow-sm"
                />
                <div v-else class="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
                  <Icon name="library" size="24" class="text-gray-400" />
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded flex items-end p-1">
                  <p class="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition">{{ book.title }}</p>
                </div>
              </div>
            </div>
            <button class="w-full text-purple-600 hover:text-purple-700 text-sm font-medium">
              → View All Books
            </button>
          </div>
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
  return authors.value.filter(a => 
    a.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredPublishers = computed(() => {
  if (!searchQuery.value) return publishers.value;
  return publishers.value.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredSeries = computed(() => {
  if (!searchQuery.value) return series.value;
  return series.value.filter(s => 
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
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
