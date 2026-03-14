<template>
    <Card>
        <template #header>
            <div class="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  :checked="isSelected"
                  @change="$emit('toggle-select')"
                  class="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <div>
                    <h3 class="text-lg font-bold">{{ book.title }} - {{ book.volume }}</h3>
                    <p class="text-sm text-muted-foreground">By {{ authorNames }}</p>
                                    <div v-if="book.rating" class="flex items-center gap-1 mt-1">
                                        <span class="text-yellow-400">{{ '★'.repeat(book.rating) }}{{ '☆'.repeat(5 - book.rating) }}</span>
                                        <span class="text-xs text-gray-600">{{ book.rating }}/5</span>
                                    </div>
                </div>
            </div>
        </template>
        <template #header-action>
            <Button variant="ghost" size="icon" @click="navigateToDetail">
                <Icon name="bookdetail" size="20" class="text-muted-foreground" />
            </Button>
        </template>
        <template #content>
            <img :src="book.coverUrl" :alt="`Cover of ${book.title}`"
                :class="layout === 'grid' ? 'w-full h-48 object-cover rounded-md mb-4' : 'w-24 h-24 object-cover rounded-md'" />
            <div class="text-sm text-gray-600 space-y-2">
                <div>出版社: {{ publisherName }}</div>
                <div>シリーズ: {{ seriesName }}</div>
            </div>
        </template>
    </Card>

    <div v-if="isMenuVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg p-4 flex gap-4">
            <!-- 本の画像 -->
            <img :src="book.coverUrl" :alt="`Cover of ${book.title}`" class="object-cover rounded-md" />

            <!-- メニュー -->
            <div class="flex flex-col gap-2">
                <Button variant="secondary" disabled title="近日実装予定">
                    <Icon name="library" size="20" class="text-muted-foreground" />
                    詳細
                </Button>
                <Button variant="secondary" disabled title="近日実装予定">
                    <Icon name="coverup" size="20" class="text-muted-foreground" />
                    表紙アップロード
                </Button>
                <Button variant="secondary" @click="navigateToEdit(book.id)">
                    <Icon name="edit" size="20" class="text-muted-foreground" />
                    編集
                </Button>
                <Button variant="destructive" @click="handleDelete(book.id)">
                    <Icon name="trash" size="20" class="text-muted-foreground" />
                    削除
                </Button>
                <Button variant="ghost" @click="toggleMenu">閉じる</Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import Card from './Card.vue';
import Button from './Button.vue';
import Icon from '../icons.vue';
import { computed, ref } from 'vue'; // ref を追加
import { useRouter } from 'vue-router'; // router 用
const emit = defineEmits(['book-deleted', 'toggle-select']); // emit を定義
const router = useRouter();

const props = defineProps({
    book: {
        type: Object,
        required: true,
    },
    layout: {
        type: String,
        required: true,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
});

const isMenuVisible = ref(false);

const toggleMenu = () => {
    isMenuVisible.value = !isMenuVisible.value;
};

const navigateToDetail = () => {
    router.push(`/books/${props.book.id}`);
};

const navigateToEdit = (bookId) => {
    // 編集ページに遷移し、ヘッダーで bookId を渡す
    router.push({ path: '/new' });
    sessionStorage.setItem('x-book-id', bookId);
};

const handleDelete = async (id) => {
    const confirmed = window.confirm('本当にこの本を削除しますか？');
    if (confirmed) {
        try {
            const response = await fetch('/api/bookCrud', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('削除に失敗しました');
            }
            alert('書籍が正常に削除されました');
            emit('book-deleted', id);

            toggleMenu();

        } catch (error) {
            alert('削除中にエラーが発生しました');
        }
    }
};

const publisherName = computed(() => props.book.publisher?.name ?? '―');
const seriesName = computed(() => props.book.series?.name ?? '―');
const authorNames = computed(() => (props.book.authors ?? [])
  .map((a) => a.author?.name)
  .filter(Boolean)
  .join(', ') || '―');
</script>

<style scoped>
/* メニューのオーバーレイスタイル */
.fixed {
    position: fixed;
}

.inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.bg-opacity-50 {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>