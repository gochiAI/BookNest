<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">書籍をアップロード</h1>
      <p class="text-gray-600 mt-2">CSVファイルから複数の書籍情報を一括登録できます</p>
    </div>

    <!-- BookUpload.vueの内容を移植 -->
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2">CSV一括登録</h2>
        <p class="text-gray-600 text-sm">CSVファイルから複数の書籍を一括で登録できます</p>
      </div>

      <!-- ファイルアップロードエリア -->
      <div class="mb-6">
        <div class="mb-4 flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">エンコーディング:</label>
          <div class="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              :class="encoding === 'UTF-8' ? 'bg-blue-50 border-blue-500' : ''"
              @click="setEncoding('UTF-8')"
            >
              UTF-8
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              :class="encoding === 'Shift_JIS' ? 'bg-blue-50 border-blue-500' : ''"
              @click="setEncoding('Shift_JIS')"
            >
              Shift_JIS
            </Button>
          </div>
        </div>
        
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input 
            ref="fileInput"
            type="file" 
            @change="handleFileUpload" 
            accept=".csv" 
            class="hidden"
          />
          <Button 
            variant="secondary" 
            @click="$refs.fileInput.click()"
            :disabled="isLoading"
          >
            <Icon name="upload" size="20" class="mr-2" />
            CSVファイルを選択
          </Button>
          <p class="text-sm text-gray-500 mt-2">形式: タイトル, 著者, ISBN, 出版社, 出版年</p>
          <p class="text-xs text-gray-400 mt-1">※日本語が文字化けする場合は Shift_JIS を選択してください</p>
        </div>
      </div>

      <!-- ローディング表示 -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">処理中...</p>
      </div>

      <!-- 書籍リスト -->
      <div v-if="selectedBooks.length > 0 && !isLoading" class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">読み込んだ書籍 ({{ selectedBooks.length }}冊)</h3>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="selectAll">
              全て選択
            </Button>
            <Button variant="outline" size="sm" @click="deselectAll">
              全て解除
            </Button>
          </div>
        </div>

        <!-- 検索・ソートバー -->
        <div class="flex flex-wrap gap-4 mb-4 items-center">
          <input
            v-model="searchTitle"
            type="text"
            placeholder="タイトルで検索"
            class="border rounded px-3 py-1 text-sm w-64"
          />
          <select v-model="sortOption" class="border rounded px-2 py-1 text-sm">
            <option value="title-asc">タイトル昇順</option>
            <option value="title-desc">タイトル降順</option>
            <option value="author-asc">著者昇順</option>
            <option value="author-desc">著者降順</option>
          </select>
        </div>

        <!-- フィルターセクション -->
        <div v-if="availableFilters.length > 0" class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm font-semibold mb-3 text-gray-700">フィルター: </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in availableFilters"
              :key="filter"
              @click="toggleFilter(filter)"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedFilters.includes(filter)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-blue-300 hover:bg-blue-100'
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <div class="border rounded-lg divide-y max-h-96 overflow-y-auto">
          <div 
            v-for="book in filteredAndSortedBooks" 
            :key="book.id"
            class="p-4 hover:bg-gray-50 flex items-start gap-3"
          >
            <input 
              type="checkbox" 
              v-model="book.selected" 
              class="mt-1"
            />
            <div class="flex-1">
              <h4 class="font-medium">{{ book.title }}<span v-if="book.volume" class="text-sm text-gray-600"> Vol.{{ book.volume }}</span></h4>
              <p class="text-sm text-gray-600">{{ book.author }}</p>
              <div v-if="book.filters && book.filters.length > 0" class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="filter in book.filters"
                  :key="filter"
                  class="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                >
                  {{ filter }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">ISBN: {{ book.isbn || 'なし' }} | 出版社: {{ book.publisher || 'なし' }} | 出版年: {{ book.publishedYear || 'なし' }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <Button variant="outline" @click="clearBooks">
            クリア
          </Button>
          <Button 
            variant="primary" 
            @click="handleRegister"
            :disabled="isLoading || filteredAndSortedBooks.filter(b => b.selected).length === 0"
          >
            <Icon name="check" size="16" class="mr-1" />
            {{ filteredAndSortedBooks.filter(b => b.selected).length }}冊を登録
          </Button>
        </div>
      </div>

      <!-- 補完候補選択ダイアログ -->
      <div 
        v-if="showCandidateSelector" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="cancelEnrichment"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div class="p-6 border-b">
            <h3 class="text-xl font-bold">書籍情報の候補を選択してください</h3>
            <p class="text-sm text-gray-600 mt-1">複数の候補が見つかりました。正しい情報を選択してください</p>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-3">
              <div
                v-for="(candidate, index) in enrichmentCandidates"
                :key="index"
                class="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors"
                @click="selectEnrichmentCandidate(candidate)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-lg">{{ candidate.title }}<span v-if="candidate.volume" class="text-sm text-gray-600"> Vol.{{ candidate.volume }}</span></h4>
                    <p class="text-gray-700 mt-1">著者: {{ candidate.author || '不明' }}</p>
                    <p class="text-sm text-gray-600 mt-1">出版社: {{ candidate.publisher || '不明' }}</p>
                    <p class="text-sm text-gray-600">出版年: {{ candidate.publishedYear || '不明' }}</p>
                    <p class="text-sm text-gray-600" v-if="candidate.isbn">ISBN: {{ candidate.isbn }}</p>
                  </div>
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ candidate.source }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 border-t bg-gray-50 flex justify-end gap-2">
            <Button variant="outline" @click="cancelEnrichment">
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import useBookUpload from '@/composables/useBookUpload';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';

const { 
  selectedBooks, 
  uploadCSV, 
  registerBooks, 
  isLoading, 
  encoding, 
  setEncoding,
  enrichmentCandidates,
  showCandidateSelector,
  selectEnrichmentCandidate,
  cancelEnrichment,
  availableFilters,
  selectedFilters,
  toggleFilter,
  getFilteredBooks
} = useBookUpload();
const fileInput = ref(null);

const searchTitle = ref('');
const sortOption = ref('title-asc');

const filteredAndSortedBooks = computed(() => {
  let books = getFilteredBooks();
  // タイトル検索
  if (searchTitle.value) {
    const keyword = searchTitle.value.toLowerCase();
    books = books.filter(b => (b.title || '').toLowerCase().includes(keyword));
  }
  // ソート
  switch (sortOption.value) {
    case 'title-asc':
      books = books.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'title-desc':
      books = books.slice().sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      break;
    case 'author-asc':
      books = books.slice().sort((a, b) => (a.author || '').localeCompare(b.author || ''));
      break;
    case 'author-desc':
      books = books.slice().sort((a, b) => (b.author || '').localeCompare(a.author || ''));
      break;
  }
  return books;
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadCSV(file);
  }
};

const selectAll = () => {
  filteredAndSortedBooks.value.forEach(book => book.selected = true);
};

const deselectAll = () => {
  filteredAndSortedBooks.value.forEach(book => book.selected = false);
};

const clearBooks = () => {
  selectedBooks.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleRegister = async () => {
  await registerBooks();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>
