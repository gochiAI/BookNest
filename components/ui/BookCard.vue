<template>
    <Card>
        <template #header>
            <div>
                <h3 class="text-lg font-bold">{{ book.title }} - {{ book.volume }}</h3>
                <p class="text-sm text-muted-foreground">By {{ book.author.name }}</p>
            </div>
        </template>
        <template #header-action>
            <Button variant="ghost" size="icon" @click="toggleMenu">
                <Icon name="bookdetail" size="20" class="text-muted-foreground" />
            </Button>
        </template>
        <template #content>
            <img :src="book.coverUrl" :alt="`Cover of ${book.title}`"
                :class="layout === 'grid' ? 'w-full h-48 object-cover rounded-md mb-4' : 'w-24 h-24 object-cover rounded-md'" />
        </template>
    </Card>

    <div v-if="isMenuVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg p-4 flex gap-4">
            <!-- 本の画像 -->
            <img :src="book.coverUrl" :alt="`Cover of ${book.title}`" class="object-cover rounded-md" />

            <!-- メニュー -->
            <div class="flex flex-col gap-2">
                <Button variant="secondary" @click="">
                    <Icon name="library" size="20" class="text-muted-foreground" />
                    詳細
                </Button>
                <Button variant="secondary" @click="">
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

<script>
import Card from './Card.vue';
import Button from './Button.vue';
import Icon from '../icons.vue';

export default {
    name: 'BookCard',
    components: {
        Card,
        Button,
        Icon,
    },
    props: {
        book: {
            type: Object,
            required: true,
        },
        layout: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            isMenuVisible: false, // メニューの表示状態を管理
        };
    },
    methods: {
        toggleMenu() {
            this.isMenuVisible = !this.isMenuVisible;
        },
        navigateToEdit(bookId) {
            // 編集ページに遷移し、ヘッダーで bookId を渡す
            this.$router.push({ path: '/new' });
            sessionStorage.setItem('x-book-id', bookId);
        },
        async handleDelete(id) {
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

                } catch (error) {
                    alert('削除中にエラーが発生しました');
                }
            }
        },
    },
};
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