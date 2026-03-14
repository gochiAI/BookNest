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
        <h1 class="text-3xl font-bold">{{ collection?.name }}</h1>
        <p v-if="collection?.description" class="text-gray-600 mt-2">
          {{ collection.description }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button @click="showAddBookDialog = true" variant="secondary">
          <Icon name="add" size="20" class="mr-2" />
          Add Book
        </Button>
      </div>
    </div>

    <!-- コレクション内の本一覧 -->
    <div v-if="books.length > 0" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="book in books"
        :key="book.id"
        class="border rounded-lg p-4 hover:shadow-lg transition"
      >
        <div class="flex gap-4">
          <img
            v-if="book.coverUrl"
            :src="book.coverUrl"
            :alt="book.title"
            class="w-20 h-24 object-cover rounded"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-sm">{{ book.title }}</h3>
            <p class="text-xs text-gray-600">
              {{ book.authors?.[0]?.author?.name || 'Unknown Author' }}
            </p>
            <div class="mt-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                @click="removeBookFromCollection(book.id)"
              >
                <Icon name="trash" size="16" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500">No books in this collection yet</p>
    </div>

    <!-- 本を追加するダイアログ -->
    <AlertDialog v-model="showAddBookDialog">
      <template #title>Add Book to Collection</template>
      <template #content>
        <div class="space-y-4">
          <div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search books..."
              class="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div class="max-h-64 overflow-y-auto border rounded-md">
            <div
              v-for="availableBook in filteredAvailableBooks"
              :key="availableBook.id"
              class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              @click="addBookToCollection(availableBook.id)"
            >
              <h4 class="font-medium text-sm">{{ availableBook.title }}</h4>
              <p class="text-xs text-gray-600">
                {{ availableBook.authors?.[0]?.author?.name || 'Unknown Author' }}
              </p>
            </div>
            <div
              v-if="filteredAvailableBooks.length === 0"
              class="p-4 text-center text-gray-500 text-sm"
            >
              No books available
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showAddBookDialog = false">Close</Button>
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

const collection = ref(null);
const books = ref([]);
const allBooks = ref([]);
const showAddBookDialog = ref(false);
const searchQuery = ref('');

const collectionId = computed(() => route.params.id);

const filteredAvailableBooks = computed(() => {
  const bookIdsInCollection = books.value.map(b => b.id);
  return allBooks.value.filter(book => {
    const notInCollection = !bookIdsInCollection.includes(book.id);
    const matchesSearch = !searchQuery.value ||
      book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      book.authors?.some(a => a.author.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    return notInCollection && matchesSearch;
  });
});

const loadCollection = async () => {
  try {
    const response = await fetch(`/api/collections/${collectionId.value}`);
    if (!response.ok) throw new Error('Failed to fetch collection');
    const result = await response.json();
    collection.value = result.data;
    
    // コレクション内の本をコレクションデータから取得
    books.value = result.data?.books || [];
  } catch (error) {
    console.error('Error loading collection:', error);
    alert('Failed to load collection');
  }
};

const loadBooks = async () => {
  try {
    const response = await fetch('/api/bookSearch?page=1&itemsPerPage=1000');
    if (!response.ok) throw new Error('Failed to fetch books');
    const result = await response.json();
    allBooks.value = result.data?.books || [];

    // コレクションに属する本を取得
    books.value = allBooks.value.filter(book =>
      book.collections?.some(c => c.collectionId === collectionId.value)
    );
  } catch (error) {
    console.error('Error loading books:', error);
    alert('Failed to load books');
  }
};

const addBookToCollection = async (bookId) => {
  try {
    const response = await fetch(`/api/books/${bookId}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId: collectionId.value }),
    });

    if (!response.ok) throw new Error('Failed to add book to collection');

    await loadCollection();
    showAddBookDialog.value = false;
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Failed to add book to collection');
  }
};

const removeBookFromCollection = async (bookId) => {
  if (!window.confirm('Remove this book from the collection?')) return;

  try {
    const response = await fetch(`/api/books/${bookId}/collections`, {
      method: 'DELETE',
      headers: { 'x-collection-id': collectionId.value },
    });

    if (!response.ok) throw new Error('Failed to remove book from collection');

    await loadCollection();
  } catch (error) {
    console.error('Error removing book:', error);
    alert('Failed to remove book from collection');
  }
};

onMounted(() => {
  loadCollection();
  loadBooks();
});
</script>

<style scoped>
/* スタイル */
</style>
