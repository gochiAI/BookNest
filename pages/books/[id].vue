<template>
  <div class="space-y-6">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <button
          @click="() => $router.back()"
          class="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Icon name="left" size="20" />
          Back
        </button>
        <h1 class="text-3xl font-bold">{{ book?.title }}</h1>
      </div>
      <div class="flex gap-2">
        <Button @click="navigateToEdit" variant="secondary">
          <Icon name="edit" size="20" class="mr-2" />
          Edit
        </Button>
        <Button @click="handleDelete" variant="destructive">
          <Icon name="trash" size="20" class="mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 本の基本情報 -->
      <div class="md:col-span-1">
        <img
          v-if="book?.coverUrl"
          :src="book.coverUrl"
          :alt="book?.title"
          class="w-full h-auto object-cover rounded-lg shadow-lg"
        />
        <div v-else class="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">No Cover</span>
        </div>
      </div>

      <!-- 本の詳細情報 -->
      <div class="md:col-span-2 space-y-6">
        <!-- 基本情報 -->
        <div class="bg-white border rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Book Information</h2>
          <div class="space-y-3 text-sm">
            <div v-if="book?.authors">
              <span class="font-medium">Authors:</span>
              <p>{{ book.authors.map(a => a.author.name).join(', ') }}</p>
            </div>
            <div v-if="book?.publisher">
              <span class="font-medium">Publisher:</span>
              <p>{{ book.publisher.name }}</p>
            </div>
            <div v-if="book?.series">
              <span class="font-medium">Series:</span>
              <p>{{ book.series.name }} Vol. {{ book.volume }}</p>
            </div>
            <div v-if="book?.releaseDate">
              <span class="font-medium">Release Date:</span>
              <p>{{ new Date(book.releaseDate).toLocaleDateString() }}</p>
            </div>
            <div v-if="book?.isbn">
              <span class="font-medium">ISBN:</span>
              <p>{{ book.isbn }}</p>
            </div>
          </div>
        </div>

        <!-- コレクション管理 -->
        <div class="bg-white border rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Collections</h2>
            <Button @click="showAddCollectionDialog = true" variant="outline" size="sm">
              <Icon name="add" size="16" />
            </Button>
          </div>
          <div class="space-y-2">
            <div
              v-for="collection in book?.collections"
              :key="collection.collectionId"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span class="text-sm">{{ collection.collection.name }}</span>
              <Button
                @click="removeCollection(collection.collectionId)"
                variant="ghost"
                size="sm"
              >
                <Icon name="trash" size="16" />
              </Button>
            </div>
            <p v-if="!book?.collections?.length" class="text-sm text-gray-500">
              No collections yet
            </p>
          </div>
        </div>

        <!-- タグ管理 -->
        <div class="bg-white border rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Tags</h2>
            <Button @click="showAddTagDialog = true" variant="outline" size="sm">
              <Icon name="add" size="16" />
            </Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="tag in book?.tags"
              :key="tag.tagId"
              class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ tag.tag.name }}
              <button
                @click="removeTag(tag.tagId)"
                class="hover:text-blue-600"
              >
                <Icon name="close" size="14" />
              </button>
            </div>
            <p v-if="!book?.tags?.length" class="text-sm text-gray-500">
              No tags yet
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- コレクション追加ダイアログ -->
    <AlertDialog v-model="showAddCollectionDialog">
      <template #title>Add to Collection</template>
      <template #content>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="collection in availableCollections"
            :key="collection.id"
            class="p-3 hover:bg-gray-50 cursor-pointer border rounded"
            @click="addCollection(collection.id)"
          >
            <h4 class="font-medium text-sm">{{ collection.name }}</h4>
            <p v-if="collection.description" class="text-xs text-gray-600">
              {{ collection.description }}
            </p>
          </div>
          <p v-if="!availableCollections.length" class="text-sm text-gray-500 text-center py-4">
            No available collections
          </p>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showAddCollectionDialog = false">Close</Button>
      </template>
    </AlertDialog>

    <!-- タグ追加ダイアログ -->
    <AlertDialog v-model="showAddTagDialog">
      <template #title>Add Tags</template>
      <template #content>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="tag in availableTags"
            :key="tag.id"
            class="p-3 hover:bg-gray-50 cursor-pointer border rounded"
            @click="addTag(tag.id)"
          >
            <h4 class="font-medium text-sm">{{ tag.name }}</h4>
          </div>
          <p v-if="!availableTags.length" class="text-sm text-gray-500 text-center py-4">
            No available tags
          </p>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showAddTagDialog = false">Close</Button>
      </template>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';
import AlertDialog from '@/components/ui/AlertDialog.vue';

const route = useRoute();
const router = useRouter();

const book = ref(null);
const allCollections = ref([]);
const allTags = ref([]);
const showAddCollectionDialog = ref(false);
const showAddTagDialog = ref(false);

const bookId = computed(() => route.params.id);

const availableCollections = computed(() => {
  const currentCollectionIds = book.value?.collections?.map(c => c.collectionId) || [];
  return allCollections.value.filter(c => !currentCollectionIds.includes(c.id));
});

const availableTags = computed(() => {
  const currentTagIds = book.value?.tags?.map(t => t.tagId) || [];
  return allTags.value.filter(t => !currentTagIds.includes(t.id));
});

const loadBook = async () => {
  try {
    const response = await fetch('/api/bookCrud', {
      headers: {
        'x-book-id': String(bookId.value),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch book');
    const result = await response.json();
    book.value = result;
  } catch (error) {
    console.error('Error loading book:', error);
    alert('Failed to load book');
  }
};

const loadCollections = async () => {
  try {
    const response = await fetch('/api/collections');
    if (!response.ok) throw new Error('Failed to fetch collections');
    const result = await response.json();
    allCollections.value = result.data || [];
  } catch (error) {
    console.error('Error loading collections:', error);
  }
};

const loadTags = async () => {
  try {
    const response = await fetch('/api/tags');
    if (!response.ok) throw new Error('Failed to fetch tags');
    const result = await response.json();
    allTags.value = result.data || [];
  } catch (error) {
    console.error('Error loading tags:', error);
  }
};

const addCollection = async (collectionId) => {
  try {
    const response = await fetch(`/api/books/${bookId.value}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId }),
    });

    if (!response.ok) throw new Error('Failed to add collection');

    await loadBook();
    showAddCollectionDialog.value = false;
  } catch (error) {
    console.error('Error adding collection:', error);
    alert('Failed to add collection');
  }
};

const removeCollection = async (collectionId) => {
  try {
    const response = await fetch(`/api/books/${bookId.value}/collections`, {
      method: 'DELETE',
      headers: { 'x-collection-id': collectionId },
    });

    if (!response.ok) throw new Error('Failed to remove collection');

    await loadBook();
  } catch (error) {
    console.error('Error removing collection:', error);
    alert('Failed to remove collection');
  }
};

const addTag = async (tagId) => {
  try {
    const response = await fetch(`/api/books/${bookId.value}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });

    if (!response.ok) throw new Error('Failed to add tag');

    await loadBook();
    showAddTagDialog.value = false;
  } catch (error) {
    console.error('Error adding tag:', error);
    alert('Failed to add tag');
  }
};

const removeTag = async (tagId) => {
  try {
    const response = await fetch(`/api/books/${bookId.value}/tags`, {
      method: 'DELETE',
      headers: { 'x-tag-id': tagId },
    });

    if (!response.ok) throw new Error('Failed to remove tag');

    await loadBook();
  } catch (error) {
    console.error('Error removing tag:', error);
    alert('Failed to remove tag');
  }
};

const navigateToEdit = () => {
  sessionStorage.setItem('x-book-id', bookId.value);
  router.push('/new');
};

const handleDelete = async () => {
  const confirmed = window.confirm('本当にこの書籍を削除しますか？');
  if (!confirmed) return;

  try {
    const response = await fetch('/api/bookCrud', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: bookId.value }),
    });

    if (!response.ok) {
      throw new Error('削除に失敗しました');
    }

    alert('書籍が正常に削除されました');
    router.push('/');
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('削除中にエラーが発生しました');
  }
};

onMounted(() => {
  loadBook();
  loadCollections();
  loadTags();
});
</script>

<style scoped>
/* スタイル */
</style>
