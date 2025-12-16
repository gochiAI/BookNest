<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold">Collections</h1>
        <Button @click="showCreateDialog = true" variant="secondary">
          <Icon name="add" size="20" class="mr-2" />
          New Collection
        </Button>
      </div>
      <p class="text-sm text-gray-600 mb-4">{{ filteredCollections.length }} collection(s)</p>
      <SearchBar 
        v-model="searchQuery" 
        :placeholder="'Search collections...'"
        :show-search-type="false"
        @search="handleSearch"
      />
    </div>

    <!-- ローディング状態 -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading collections...</p>
    </div>

    <!-- コレクション一覧（シンプルグリッド） -->
    <div v-else-if="filteredCollections.length > 0">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <GroupCard
          v-for="collection in filteredCollections"
          :key="collection.id"
          :name="collection.name"
          :book-count="collection.books?.length || 0"
          :description="collection.description"
          :books="collection.books"
          @click-card="selectCollection(collection.id)"
          @click-book="navigateToBook"
        >
          <template #actions>
            <div class="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                @click.stop="editCollection(collection)"
                class="text-xs flex-1"
              >
                <Icon name="edit" size="14" class="mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                @click.stop="deleteCollection(collection.id)"
                class="text-xs flex-1"
              >
                <Icon name="trash" size="14" class="mr-1" />
                Delete
              </Button>
            </div>
          </template>
        </GroupCard>
      </div>
    </div>

    <!-- 空状態 -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <Icon name="library" size="48" class="mx-auto text-gray-400 mb-4" />
      <p class="text-gray-600 text-lg mb-2">No collections yet</p>
      <p class="text-gray-500 text-sm mb-4">Create your first collection to organize your books</p>
      <Button @click="showCreateDialog = true" variant="secondary">
        <Icon name="add" size="16" class="mr-2" />
        Create Collection
      </Button>
    </div>

    <!-- 詳細モーダル -->
    <div v-if="selectedCollectionId" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="selectedCollectionId = null">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <!-- ヘッダー -->
        <div class="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4 flex items-center justify-between">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedCollection?.name }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ selectedCollection?.books?.length || 0 }} book(s)</p>
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
            <button @click="selectedCollectionId = null" class="text-gray-500 hover:text-gray-700">
              <Icon name="close" size="24" />
            </button>
          </div>
        </div>

        <!-- コンテンツ -->
        <div class="px-6 py-4">
          <!-- 説明 -->
          <div v-if="selectedCollection?.description" class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
            <p class="text-sm text-gray-700">{{ selectedCollection.description }}</p>
          </div>

          <!-- 本一覧 -->
          <div v-if="selectedCollection?.books && selectedCollection.books.length > 0">
            <!-- カード表示 -->
            <div v-if="displayFormat === 'card'" class="grid gap-3 grid-cols-1 md:grid-cols-2">
              <div
                v-for="book in selectedCollection.books"
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
                v-for="book in selectedCollection.books"
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
                v-for="book in selectedCollection.books"
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
          <div v-else class="text-center py-8 bg-gray-50 rounded">
            <p class="text-sm text-gray-500">No books in this collection yet</p>
          </div>
        </div>

        <!-- フッター -->
        <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-2 justify-end">
          <Button 
            variant="outline" 
            @click="() => { editCollection(selectedCollection); selectedCollectionId = null; }"
          >
            <Icon name="edit" size="16" class="mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            @click="() => { deleteCollection(selectedCollection.id); selectedCollectionId = null; }"
          >
            <Icon name="trash" size="16" class="mr-2" />
            Delete
          </Button>
          <Button variant="secondary" @click="selectedCollectionId = null">
            Close
          </Button>
        </div>
      </div>
    </div>

    <!-- 新規・編集ダイアログ -->
    <AlertDialog v-model="showCreateDialog">
      <template #title>
        {{ editingCollection ? 'Edit Collection' : 'Create New Collection' }}
      </template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium mb-1">Name *</label>
            <InputBox
              id="name"
              v-model="formData.name"
              placeholder="Collection name"
            />
          </div>
          <div>
            <label for="description" class="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Collection description (optional)"
              class="w-full border rounded-md px-3 py-2 text-sm"
              rows="4"
            />
          </div>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showCreateDialog = false">Cancel</Button>
        <Button @click="saveCollection" variant="secondary" :disabled="!formData.name.trim()">
          {{ editingCollection ? 'Update' : 'Create' }}
        </Button>
      </template>
    </AlertDialog>

    <!-- 编辑對話框 -->
    <AlertDialog v-model="showEditDialog">
      <template #title>Edit Collection</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label for="editName" class="block text-sm font-medium mb-1">Name *</label>
            <InputBox
              id="editName"
              v-model="formData.name"
              placeholder="Collection name"
            />
          </div>
          <div>
            <label for="editDescription" class="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="editDescription"
              v-model="formData.description"
              placeholder="Collection description (optional)"
              class="w-full border rounded-md px-3 py-2 text-sm"
              rows="4"
            />
          </div>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showEditDialog = false">Cancel</Button>
        <Button @click="saveCollection" variant="secondary" :disabled="!formData.name.trim()">
          Update
        </Button>
      </template>
    </AlertDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import InputBox from '@/components/ui/InputBox.vue';
import AlertDialog from '@/components/ui/AlertDialog.vue';
import Icon from '@/components/icons.vue';
import Pulldown from '@/components/ui/Pulldown.vue';
import SearchBar from '@/components/SearchBar.vue';
import GroupCard from '@/components/GroupCard.vue';

const router = useRouter();
const collections = ref([]);
const searchQuery = ref("");
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingCollection = ref(null);
const isLoading = ref(false);
const selectedCollectionId = ref<string | null>(null);
const displayFormat = ref<'card' | 'compact' | 'full'>('compact');
const collectionCache = new Map();
const formData = ref({
  name: '',
  description: '',
});

const filteredCollections = computed(() => {
  if (!searchQuery.value) return collections.value;
  const query = searchQuery.value.toLowerCase();
  return collections.value.filter(c => {
    // コレクション名と説明で検索
    if (c.name.toLowerCase().includes(query)) return true;
    if (c.description && c.description.toLowerCase().includes(query)) return true;
    
    // コレクション内の本のタイトルで検索
    if (c.books && c.books.length > 0) {
      return c.books.some(book => 
        book.title.toLowerCase().includes(query) ||
        (book.authors && book.authors.some(a => a.author?.name.toLowerCase().includes(query)))
      );
    }
    
    return false;
  });
});

const handleSearch = ({ text }) => {
  searchQuery.value = text;
};

const selectedCollection = computed(() => {
  return collections.value.find((c: any) => c.id === selectedCollectionId.value);
});

const formatDate = (date: any) => {
  if (!date) return 'recently';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString();
};

const navigateToBook = (bookId) => {
  router.push(`/books/${bookId}`);
  selectedCollectionId.value = null;
};

const selectCollection = async (collectionId) => {
  selectedCollectionId.value = collectionId;
};

const loadCollections = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    const response = await fetch('/api/collections?includeBooks=true&limit=5');
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    const result = await response.json();
    collections.value = result.data || [];
    
    // キャッシュをクリア（新しいデータを取得したため）
    collectionCache.clear();
  } catch (error) {
    console.error('Error loading collections:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    alert(`Failed to load collections: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

const loadCollectionDetails = async (collectionId) => {
  try {
    const response = await fetch(`/api/collections/${collectionId}`);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    const result = await response.json();
    
    // コレクション情報を更新
    const index = collections.value.findIndex(c => c.id === collectionId);
    if (index > -1) {
      collections.value[index] = result.data;
      // キャッシュに保存
      collectionCache.set(collectionId, result.data);
    }
  } catch (error) {
    console.error('Error loading collection details:', error);
  }
};

const saveCollection = async () => {
  if (!formData.value.name.trim()) {
    alert('Collection name is required');
    return;
  }

  try {
    const method = editingCollection.value ? 'PUT' : 'POST';
    const endpoint = editingCollection.value
      ? `/api/collections/${editingCollection.value.id}`
      : '/api/collections';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.value.name,
        description: formData.value.description,
      }),
    });

    if (!response.ok) throw new Error('Failed to save collection');

    await loadCollections();
    if (editingCollection.value) {
      showEditDialog.value = false;
    } else {
      showCreateDialog.value = false;
    }
    editingCollection.value = null;
    formData.value = { name: '', description: '' };
  } catch (error) {
    console.error('Error saving collection:', error);
    alert('Failed to save collection');
  }
};

const editCollection = (collection) => {
  editingCollection.value = collection;
  formData.value = {
    name: collection.name,
    description: collection.description || '',
  };
  showEditDialog.value = true;
  showCreateDialog.value = false;
};

const deleteCollection = async (id) => {
  if (!window.confirm('Are you sure you want to delete this collection?')) return;

  try {
    const response = await fetch(`/api/collections/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete collection');

    await loadCollections();
    // キャッシュからも削除
    collectionCache.delete(id);
    // モーダルを閉じる
    if (selectedCollectionId.value === id) {
      selectedCollectionId.value = null;
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
    alert('Failed to delete collection');
  }
};

onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
/* スタイル */
</style>
