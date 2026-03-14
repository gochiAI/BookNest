<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">BookNest - 書籍一覧</h1>
        <!-- 選択数表示 -->
        <div v-if="selectedBooks.size > 0" class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
          {{ selectedBooks.size }} book(s) selected
        </div>
      </div>

      <div class="w-full flex flex-wrap gap-4 justify-between">
        <div class="flex flex-wrap gap-4">
          <FilterBar v-model:book-type="filters.bookType" v-model:read-status="filters.readStatus" />
          <SearchBar v-model="filters.search" @search="handleSearch" @searchTypeChange="handleSearchTypeChange" />
        </div>
        <OptionsBar v-model:sort-option="sortOption" v-model:layout="layout" />
      </div>
    </div>

    <!-- バッチアクションバー -->
    <div v-if="selectedBooks.size > 0"
      class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-2">
      <span class="text-sm font-medium text-blue-900">
        {{ selectedBooks.size }} book(s) selected
        <span v-if="isBatchCoverFetching" class="ml-2">
          (Cover: {{ batchCoverDone }}/{{ batchCoverTotal }})
        </span>
      </span>
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" @click="fetchCoversForSelectedBooks" :disabled="isBatchCoverFetching">
          {{ isBatchCoverFetching ? 'Fetching Covers...' : 'Fetch Covers' }}
        </Button>
        <Button variant="secondary" size="sm" @click="showBatchCollectionDialog = true">
          <Icon name="library" size="16" class="mr-1" />
          Add to Collection
        </Button>
        <Button variant="secondary" size="sm" @click="showBatchTagDialog = true">
          <Icon name="tag" size="16" class="mr-1" />
          Add Tag
        </Button>
        <Button variant="danger" size="sm" @click="deleteSelectedBooks">
          <Icon name="trash" size="16" class="mr-1" />
          Delete
        </Button>
        <Button variant="outline" size="sm" @click="clearSelection">
          Clear Selection
        </Button>
      </div>
    </div>

    <BookShelf :books="fetchedBooks" :layout="layout" :selected-books="selectedBooks"
      @toggle-select="toggleBookSelection" @book-deleted="handleBookDeleted" />

    <PageNation :total-pages="Math.ceil(totalItems / itemsPerPage)" v-model:current-page="currentPage" />

    <!-- バッチコレクション追加ダイアログ -->
    <AlertDialog v-model="showBatchCollectionDialog">
      <template #title>Add to Collection</template>
      <template #content>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Add {{ selectedBooks.size }} book(s) to a collection</p>
          <div>
            <label for="collection" class="block text-sm font-medium mb-2">Select Collection</label>
            <select id="collection" v-model="selectedCollection" class="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">-- Select a collection --</option>
              <option v-for="collection in availableCollections" :key="collection.id" :value="collection.id">
                {{ collection.name }}
              </option>
            </select>
          </div>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showBatchCollectionDialog = false">Cancel</Button>
        <Button @click="addBooksToCollection" variant="secondary" :disabled="!selectedCollection">
          Add Books
        </Button>
      </template>
    </AlertDialog>

    <!-- バッチタグ追加ダイアログ -->
    <AlertDialog v-model="showBatchTagDialog">
      <template #title>Add Tag</template>
      <template #content>
        <div class="space-y-4">
          <p class="text-sm text-gray-600">Add tag(s) to {{ selectedBooks.size }} book(s)</p>
          <div>
            <label for="tag" class="block text-sm font-medium mb-2">Select Tag</label>
            <select id="tag" v-model="selectedTag" class="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">-- Select a tag --</option>
              <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
          </div>
        </div>
      </template>
      <template #actions>
        <Button variant="outline" @click="showBatchTagDialog = false">Cancel</Button>
        <Button @click="addBooksTag" variant="secondary" :disabled="!selectedTag">
          Add Tag
        </Button>
      </template>
    </AlertDialog>

    <!-- 書籍アップロードコンポーネント（削除済み） -->
    <Button variant="primary" class="fixed bottom-4 right-4" @click="showBookUpload = true">
      <Icon name="plus" size="16" class="mr-1" />
      Add New Book
    </Button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import BookShelf from "@/components/BookShelf.vue";
import SearchBar from "@/components/SearchBar.vue";
import FilterBar from "@/components/FilterBar.vue";
import OptionsBar from "@/components/OptionsBar.vue";
import PageNation from "../components/ui/PageNation.vue";
import Button from "@/components/ui/Button.vue";
import AlertDialog from "@/components/ui/AlertDialog.vue";
import Icon from "@/components/icons.vue";

const currentPage = ref(1);
const itemsPerPage = 6;

const filters = ref({
  readStatus: "",
  bookType: "",
  search: "",
  tag: "",
  searchType: "all",
});

const sortOption = ref("title-asc");
const layout = ref("grid");
const selectedBooks = ref(new Set());
const availableCollections = ref([]);
const availableTags = ref([]);
const showBatchCollectionDialog = ref(false);
const showBatchTagDialog = ref(false);
const selectedCollection = ref("");
const selectedTag = ref("");
const showBookUpload = ref(false);
const isBatchCoverFetching = ref(false);
const batchCoverTotal = ref(0);
const batchCoverDone = ref(0);

const handleSearch = ({ text, type }) => {
  filters.value.searchType = type;
  if (type === 'tag') {
    filters.value.tag = text;
    filters.value.search = "";
  } else {
    filters.value.search = text;
    filters.value.tag = "";
  }
  currentPage.value = 1;
};

const handleSearchTypeChange = (type) => {
  filters.value.searchType = type;
};

const apiUrl = computed(() => {
  const params = new URLSearchParams({
    ...filters.value,
    page: currentPage.value.toString(),
    itemsPerPage: itemsPerPage.toString(),
    sortOption: sortOption.value,
  });
  return `/api/bookSearch?${params.toString()}`;
});

const { data, error, pending, refresh } = useFetch(apiUrl, {
  watch: [filters, currentPage, sortOption],
  immediate: true,
});

const totalItems = computed(() => {
  return data.value?.data?.totalItems || 0;
});

const fetchedBooks = computed(() => {
  return data.value?.data?.books || [];
});

const toggleBookSelection = (bookId) => {
  if (selectedBooks.value.has(bookId)) {
    selectedBooks.value.delete(bookId);
  } else {
    selectedBooks.value.add(bookId);
  }
};

const clearSelection = () => {
  selectedBooks.value.clear();
};

const handleBookDeleted = (bookId) => {
  // 削除された書籍を選択状態から除外
  if (selectedBooks.value.has(bookId)) {
    selectedBooks.value.delete(bookId);
  }
  // データを再取得
  refresh();
};

const deleteSelectedBooks = async () => {
  if (selectedBooks.value.size === 0) return;
  if (!confirm(`${selectedBooks.value.size}冊の書籍を削除します。よろしいですか？`)) return;
  try {
    const bookIds = Array.from(selectedBooks.value);
    const results = await Promise.all(
      bookIds.map(id =>
        fetch(`/api/bookCrud`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
      )
    );
    const allSuccess = results.every(res => res.ok);
    if (allSuccess) {
      alert(`${bookIds.length}冊の書籍を削除しました。`);
    } else {
      alert('一部の書籍の削除に失敗しました。');
    }
    selectedBooks.value.clear();
    refresh();
  } catch (error) {
    console.error('Error deleting books:', error);
    alert('書籍の削除中にエラーが発生しました。');
  }
};

const normalizeIsbn = (value) => (typeof value === 'string' ? value.replace(/\D/g, '') : '');

const extractAuthorNames = (book) => {
  if (!Array.isArray(book?.authors)) return [];

  return book.authors
    .map(entry => entry?.author?.name)
    .filter(name => typeof name === 'string' && name.trim() !== '')
    .map(name => name.trim());
};

const buildUpdatePayloadWithCover = (book, coverUrl) => {
  const authorNames = extractAuthorNames(book);
  const normalizedIsbn = normalizeIsbn(book?.isbn);

  return {
    title: book?.title || '',
    authorNames: authorNames.length > 0 ? authorNames : ['不明'],
    bookType: book?.bookType || 'General',
    readStatus: book?.readStatus || 'Unread',
    isbn: normalizedIsbn.length === 13 ? normalizedIsbn : undefined,
    releaseDate: book?.releaseDate ? new Date(book.releaseDate).toISOString() : undefined,
    volume: Number.isInteger(book?.volume) ? book.volume : undefined,
    publisherName: book?.publisher?.name || undefined,
    seriesName: book?.series?.name || undefined,
    coverUrl,
  };
};

const fetchCoversForSelectedBooks = async () => {
  if (selectedBooks.value.size === 0) return;
  if (isBatchCoverFetching.value) return;

  const selectedIds = Array.from(selectedBooks.value);
  isBatchCoverFetching.value = true;
  batchCoverTotal.value = selectedIds.length;
  batchCoverDone.value = 0;

  let updatedCount = 0;
  let notFoundCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    for (const bookId of selectedIds) {
      try {
        const detailRes = await fetch('/api/bookCrud', {
          method: 'GET',
          headers: { 'x-book-id': bookId },
        });
        if (!detailRes.ok) {
          failedCount++;
          continue;
        }

        const book = await detailRes.json();
        const title = (book?.title || '').trim();
        const isbn = normalizeIsbn(book?.isbn);
        const volume = Number.isInteger(book?.volume) ? book.volume : undefined;

        if (!title && !isbn) {
          skippedCount++;
          continue;
        }

        const coverRes = await fetch('/api/bookCrud/cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isbn: isbn || undefined,
            title: title || undefined,
            volume,
          }),
        });

        if (!coverRes.ok) {
          failedCount++;
          continue;
        }

        const coverData = await coverRes.json();
        if (!coverData?.coverUrl) {
          notFoundCount++;
          continue;
        }

        if (book?.coverUrl === coverData.coverUrl) {
          skippedCount++;
          continue;
        }

        const payload = buildUpdatePayloadWithCover(book, coverData.coverUrl);
        const updateRes = await fetch('/api/bookCrud', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-book-id': bookId,
          },
          body: JSON.stringify(payload),
        });

        if (updateRes.ok) {
          updatedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
        console.error(`[cover-batch] failed for book: ${bookId}`, error);
      } finally {
        batchCoverDone.value += 1;
      }
    }
  } finally {
    isBatchCoverFetching.value = false;
    refresh();
  }

  alert(
    `Cover fetch done.\nUpdated: ${updatedCount}\nNot found: ${notFoundCount}\nSkipped: ${skippedCount}\nFailed: ${failedCount}`
  );
};

const loadCollectionsAndTags = async () => {
  try {
    const [collectionsRes, tagsRes] = await Promise.all([
      fetch('/api/collections'),
      fetch('/api/tags'),
    ]);

    if (collectionsRes.ok) {
      const data = await collectionsRes.json();
      availableCollections.value = data.data || [];
    }

    if (tagsRes.ok) {
      const data = await tagsRes.json();
      availableTags.value = data.data || [];
    }
  } catch (error) {
    console.error('Error loading collections and tags:', error);
  }
};

const addBooksToCollection = async () => {
  if (!selectedCollection.value || selectedBooks.value.size === 0) return;

  try {
    const bookIds = Array.from(selectedBooks.value);
    const results = await Promise.all(
      bookIds.map(bookId =>
        fetch(`/api/books/${bookId}/collections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionId: selectedCollection.value }),
        })
      )
    );

    const allSuccess = results.every(res => res.ok);
    if (allSuccess) {
      alert(`Added ${bookIds.length} book(s) to collection`);
      showBatchCollectionDialog.value = false;
      selectedCollection.value = "";
      selectedBooks.value.clear();
    } else {
      alert('Failed to add some books to collection');
    }
  } catch (error) {
    console.error('Error adding books to collection:', error);
    alert('Error adding books to collection');
  }
};

const addBooksTag = async () => {
  if (!selectedTag.value || selectedBooks.value.size === 0) return;

  try {
    const bookIds = Array.from(selectedBooks.value);
    const results = await Promise.all(
      bookIds.map(bookId =>
        fetch(`/api/books/${bookId}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: selectedTag.value }),
        })
      )
    );

    const allSuccess = results.every(res => res.ok);
    if (allSuccess) {
      alert(`Added tag to ${bookIds.length} book(s)`);
      showBatchTagDialog.value = false;
      selectedTag.value = "";
      selectedBooks.value.clear();
    } else {
      alert('Failed to add tag to some books');
    }
  } catch (error) {
    console.error('Error adding tag to books:', error);
    alert('Error adding tag to books');
  }
};

const handleUploadSuccess = () => {
  // アップロード成功時の処理
  refresh();
};

onMounted(() => {
  loadCollectionsAndTags();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
