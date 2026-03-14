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
      <div class="md:col-span-1 space-y-2">
        <img
          v-if="book?.coverUrl"
          :src="coverPreviewUrl || book.coverUrl"
          :alt="book?.title"
          class="w-full h-auto object-cover rounded-lg shadow-lg"
        />
        <div v-else class="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">No Cover</span>
        </div>
        <Button
          @click="registerCover"
          :disabled="coverLoading"
          variant="outline"
          class="w-full"
        >
          <Icon name="edit" size="16" class="mr-2" />
          {{ coverLoading ? '書影取得中...' : '書影登録' }}
        </Button>
        <Button
          v-if="coverCandidates.length > 0"
          @click="showCoverCandidateSelector = true"
          variant="outline"
          class="w-full"
        >
          候補 {{ coverCandidates.length }}件から選択
        </Button>
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
        <!-- レビュー & 評価 -->
        <BookReview
          :book-id="bookId"
          :rating="book?.rating"
          :review-comment="book?.reviewComment"
          :completed-date="book?.completedDate"
          @update="handleReviewUpdate"
        />
      </div>
    </div>

    <!-- コレクション追加ダイアログ -->
    <AlertDialog v-model="showAddCollectionDialog">
      <template #title>Add to Collection</template>
      <template #content>
        <!-- 新規コレクション作成フォーム -->
        <div class="mb-4 p-3 border rounded-lg bg-gray-50">
          <p class="text-xs font-semibold text-gray-600 mb-2">新規コレクションを作成</p>
          <input
            v-model="newCollectionName"
            type="text"
            placeholder="コレクション名"
            class="w-full border rounded px-2 py-1 text-sm mb-2"
            @keydown.enter.prevent="createCollection"
          />
          <input
            v-model="newCollectionDescription"
            type="text"
            placeholder="説明（任意）"
            class="w-full border rounded px-2 py-1 text-sm mb-2"
            @keydown.enter.prevent="createCollection"
          />
          <Button variant="outline" size="sm" :disabled="!newCollectionName.trim()" @click="createCollection">作成</Button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto">
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
        <!-- 新規タグ作成フォーム -->
        <div class="mb-4 p-3 border rounded-lg bg-gray-50">
          <p class="text-xs font-semibold text-gray-600 mb-2">新規タグを作成</p>
          <div class="flex gap-2">
            <input
              v-model="newTagName"
              type="text"
              placeholder="タグ名"
              class="flex-1 border rounded px-2 py-1 text-sm"
              @keydown.enter.prevent="createTag"
            />
            <Button variant="outline" size="sm" :disabled="!newTagName.trim()" @click="createTag">作成</Button>
          </div>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto">
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

    <!-- 書影候補選択モーダル -->
    <div v-if="showCoverCandidateSelector"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCoverCandidateSelector = false">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b">
          <h3 class="text-xl font-bold">書影候補を選択してください</h3>
          <p class="text-sm text-gray-600 mt-1">{{ book?.title }}<span v-if="book?.volume"> Vol.{{ book.volume }}</span></p>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-3">
            <div
              v-for="(candidate, index) in coverCandidates"
              :key="`${candidate.remoteUrl}-${index}`"
              class="border rounded-lg p-4 transition-colors"
              :class="isSelectingCoverCandidate ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 hover:border-blue-300 cursor-pointer'"
              @click="selectCoverCandidate(candidate)"
            >
              <div class="flex items-start gap-4">
                <div class="w-14 h-20 rounded border bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  <img :src="candidate.previewUrl || candidate.remoteUrl" :alt="candidate.title || book?.title" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="font-medium text-sm">{{ candidate.title || book?.title || 'タイトル不明' }}</p>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ candidate.source }}</span>
                  </div>
                  <p v-if="candidate.volume" class="text-xs text-gray-600 mt-1">候補巻数: Vol.{{ candidate.volume }}</p>
                  <p v-if="candidate.isbn" class="text-xs text-gray-600 mt-1">ISBN: {{ candidate.isbn }}</p>
                  <p v-if="candidate.matchedVolume" class="text-xs text-green-700 mt-1">巻数一致候補</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end">
          <Button variant="outline" :disabled="isSelectingCoverCandidate" @click="showCoverCandidateSelector = false">閉じる</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';
import AlertDialog from '@/components/ui/AlertDialog.vue';
import BookReview from '@/components/ui/BookReview.vue';

const route = useRoute();
const router = useRouter();

const book = ref(null);
const allCollections = ref([]);
const allTags = ref([]);
const showAddCollectionDialog = ref(false);
const showAddTagDialog = ref(false);
const coverLoading = ref(false);
const coverPreviewUrl = ref('');
const coverCandidates = ref([]);
const showCoverCandidateSelector = ref(false);
const isSelectingCoverCandidate = ref(false);
const newTagName = ref('');
const newCollectionName = ref('');
const newCollectionDescription = ref('');

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

const handleReviewUpdate = async (data) => {
  try {
    const response = await fetch('/api/bookCrud', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-book-id': String(bookId.value),
      },
      body: JSON.stringify({
        ...book.value,
        rating: data.rating,
        reviewComment: data.reviewComment,
        completedDate: data.completedDate,
      }),
    });

    if (!response.ok) throw new Error('Failed to update review');
    await loadBook();
    alert('レビューが保存されました');
  } catch (error) {
    console.error('Error updating review:', error);
    alert('レビューの保存に失敗しました');
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

const createTag = async () => {
  const name = newTagName.value.trim();
  if (!name) return;
  try {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create tag');
    const result = await response.json();
    newTagName.value = '';
    await loadTags();
    await addTag(result.data.id);
  } catch (error) {
    console.error('Error creating tag:', error);
    alert('タグの作成に失敗しました');
  }
};

const createCollection = async () => {
  const name = newCollectionName.value.trim();
  if (!name) return;
  try {
    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: newCollectionDescription.value.trim() || undefined }),
    });
    if (!response.ok) throw new Error('Failed to create collection');
    const result = await response.json();
    newCollectionName.value = '';
    newCollectionDescription.value = '';
    await loadCollections();
    await addCollection(result.data.id);
  } catch (error) {
    console.error('Error creating collection:', error);
    alert('コレクションの作成に失敗しました');
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

const applyCoverUrl = async (coverUrl) => {
  await fetch('/api/bookCrud', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-book-id': String(bookId.value),
    },
    body: JSON.stringify({ coverUrl }),
  });
  book.value.coverUrl = coverUrl;
  coverPreviewUrl.value = `${coverUrl}${coverUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
};

const registerCover = async () => {
  if (!book.value) return;
  coverLoading.value = true;
  try {
    const res = await fetch('/api/bookCrud/cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.value.title,
        isbn: book.value.isbn,
        volume: book.value.volume ?? undefined,
      }),
    });
    const data = await res.json();
    if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
      coverCandidates.value = data.candidates;
    }
    if (data.coverUrl) {
      await applyCoverUrl(data.coverUrl);
    } else if (coverCandidates.value.length > 0) {
      showCoverCandidateSelector.value = true;
    } else {
      alert('書影が見つかりませんでした');
    }
  } catch (e) {
    console.error('Cover registration failed:', e);
    alert('書影登録に失敗しました');
  } finally {
    coverLoading.value = false;
  }
};

const selectCoverCandidate = async (candidate) => {
  if (!candidate?.remoteUrl) return;
  isSelectingCoverCandidate.value = true;
  try {
    const res = await fetch('/api/bookCrud/cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.value.title,
        isbn: book.value.isbn,
        volume: book.value.volume ?? undefined,
        candidateUrl: candidate.remoteUrl,
        candidateSource: candidate.source,
      }),
    });
    const data = await res.json();
    if (data.coverUrl) {
      await applyCoverUrl(data.coverUrl);
      showCoverCandidateSelector.value = false;
    } else {
      alert('候補の適用に失敗しました');
    }
  } catch (e) {
    console.error('Cover candidate selection failed:', e);
    alert('書影候補の適用に失敗しました');
  } finally {
    isSelectingCoverCandidate.value = false;
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
