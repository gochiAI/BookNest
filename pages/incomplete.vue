<template>
    <div class="p-6">
        <div class="flex items-center gap-4 mb-4">
            <h1 class="text-2xl font-bold">不足情報の本リスト</h1>
            <button @click="fetchBooks" :disabled="loading"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm disabled:opacity-50">更新</button>
        </div>
        <div v-if="loading" class="text-gray-500">読込中...</div>
        <div v-else>
            <div v-if="books.length === 0" class="text-gray-500">該当する本はありません。</div>
            <div v-else class="space-y-4">
                <div v-for="book in books" :key="book.id" class="p-4 bg-white rounded shadow flex flex-col gap-2">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-24 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                            <img v-if="book.coverUrl" :src="book.coverPreviewUrl || book.coverUrl" class="object-cover w-full h-full" />
                            <span v-else class="text-xs text-gray-400">No Cover</span>
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold">{{ book.title }}</div>
                            <div class="text-sm text-gray-500">ID: {{ book.id }}</div>
                            <div class="text-sm text-gray-500">巻数: <span v-if="book.volume">{{ book.volume
                                    }}</span><span v-else class="text-red-500">未入力</span></div>
                            <div class="text-sm text-gray-500" v-if="!book.coverUrl"><span
                                    class="text-red-500">書影未登録</span></div>
                            <div class="text-sm text-gray-500" v-if="duplicatedCovers[book.coverUrl]">書影重複</div>
                        </div>
                    </div>
                    <!-- 不足情報入力欄例 -->
                    <div class="flex gap-2 mt-2">
                        <input v-model="book.editVolume" type="number" placeholder="巻数を入力"
                            class="border rounded px-2 py-1 w-24" />
                        <button @click="saveVolume(book)"
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">保存</button>
                        <button v-if="!book.coverUrl || duplicatedCovers[book.coverUrl]" @click="registerCover(book)"
                            :disabled="book.coverStatus === 'loading'"
                            class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50">
                            {{ book.coverStatus === 'loading' ? '取得中...' : '書影登録' }}
                        </button>
                        <button v-if="book.coverCandidates?.length > 0" @click="openCoverSelector(book)"
                            class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                            候補 {{ book.coverCandidates.length }}件
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 書影候補選択モーダル -->
    <div v-if="showCoverSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showCoverSelector = false">
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div class="p-6 border-b">
                <h3 class="text-xl font-bold">書影候補を選択してください</h3>
                <p class="text-sm text-gray-600 mt-1">{{ selectorBook?.title }}<span v-if="selectorBook?.volume"> Vol.{{ selectorBook.volume }}</span></p>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
                <div class="space-y-3">
                    <div v-for="(candidate, index) in selectorBook?.coverCandidates" :key="`${candidate.remoteUrl}-${index}`"
                        class="border rounded-lg p-4 transition-colors"
                        :class="isSelectingCover ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 hover:border-blue-300 cursor-pointer'"
                        @click="selectCandidate(candidate)">
                        <div class="flex items-start gap-4">
                            <div class="w-14 h-20 rounded border bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                <img :src="candidate.previewUrl || candidate.remoteUrl" :alt="candidate.title || selectorBook?.title" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between gap-2">
                                    <p class="font-medium text-sm">{{ candidate.title || selectorBook?.title || 'タイトル不明' }}</p>
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
                <button @click="showCoverSelector = false" :disabled="isSelectingCover"
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50">閉じる</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { $fetch } from 'ofetch';

const books = ref<any[]>([]);
const loading = ref(true);
const duplicatedCovers = ref<Record<string, boolean>>({});
const showCoverSelector = ref(false);
const selectorBook = ref<any>(null);
const isSelectingCover = ref(false);

async function fetchBooks() {
    loading.value = true;
    duplicatedCovers.value = {};
    const res = await $fetch('/api/bookCrud/incomplete');
    books.value = res.books.map((b: any) => ({ ...b, editVolume: b.volume ?? '' }));
    // 書影重複判定
    const coverCount: Record<string, number> = {};
    for (const b of books.value) {
        if (b.coverUrl) coverCount[b.coverUrl] = (coverCount[b.coverUrl] || 0) + 1;
    }
    for (const url in coverCount) {
        if (coverCount[url] > 1) duplicatedCovers.value[url] = true;
    }
    loading.value = false;
}

onMounted(fetchBooks);

async function saveVolume(book: any) {
    await $fetch(`/api/bookCrud`, {
        method: 'PUT',
        headers: { 'x-book-id': book.id },
        body: { volume: book.editVolume ? Number(book.editVolume) : null },
    });
    book.volume = book.editVolume;
}

async function applyCoverUrl(book: any, coverUrl: string) {
    await $fetch(`/api/bookCrud`, {
        method: 'PUT',
        headers: { 'x-book-id': book.id },
        body: { coverUrl },
    });
    delete duplicatedCovers.value[book.coverUrl];
    book.coverUrl = coverUrl;
    book.coverPreviewUrl = `${coverUrl}${coverUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    book.coverStatus = 'done';
}

async function registerCover(book: any) {
    book.coverStatus = 'loading';
    try {
        const res = await $fetch('/api/bookCrud/cover', {
            method: 'POST',
            body: {
                title: book.title,
                isbn: book.isbn,
                volume: book.volume ?? undefined,
            },
        });
        if (Array.isArray(res.candidates) && res.candidates.length > 0) {
            book.coverCandidates = res.candidates;
        }
        if (res.coverUrl) {
            await applyCoverUrl(book, res.coverUrl);
        } else if (book.coverCandidates?.length > 0) {
            book.coverStatus = 'error';
            openCoverSelector(book);
        } else {
            book.coverStatus = 'error';
            alert('書影が見つかりませんでした');
        }
    } catch (e) {
        book.coverStatus = 'error';
        alert('書影登録に失敗しました');
    }
}

function openCoverSelector(book: any) {
    selectorBook.value = book;
    showCoverSelector.value = true;
}

async function selectCandidate(candidate: any) {
    const book = selectorBook.value;
    if (!book || !candidate?.remoteUrl) return;
    isSelectingCover.value = true;
    try {
        const res = await $fetch('/api/bookCrud/cover', {
            method: 'POST',
            body: {
                title: book.title,
                isbn: book.isbn,
                volume: book.volume ?? undefined,
                candidateUrl: candidate.remoteUrl,
                candidateSource: candidate.source,
            },
        });
        if (res.coverUrl) {
            await applyCoverUrl(book, res.coverUrl);
            showCoverSelector.value = false;
        } else {
            alert('候補の適用に失敗しました');
        }
    } catch (e) {
        alert('書影候補の適用に失敗しました');
    } finally {
        isSelectingCover.value = false;
    }
}
</script>
