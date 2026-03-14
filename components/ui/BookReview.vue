<template>
  <div class="bg-white border rounded-lg p-6">
    <h3 class="text-lg font-semibold mb-6">レビュー & 評価</h3>

    <!-- 星評価 -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-3">評価</label>
      <div class="flex items-center gap-2">
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="localRating = star"
            :class="[
              'text-2xl transition-colors',
              star <= (localRating || 0) ? 'text-yellow-400' : 'text-gray-300',
            ]"
          >
            ★
          </button>
        </div>
        <span v-if="localRating" class="text-sm text-gray-600 ml-2">
          {{ localRating }} / 5
        </span>
        <span v-else class="text-sm text-gray-500 ml-2">
          未評価
        </span>
      </div>
    </div>

    <!-- 読了日 -->
    <div class="mb-6">
      <label for="completedDate" class="block text-sm font-medium mb-2">読了日</label>
      <input
        id="completedDate"
        v-model="localCompletedDate"
        type="date"
        class="w-full border rounded-md px-3 py-2 text-sm"
      />
      <p v-if="localCompletedDate" class="text-xs text-gray-500 mt-1">
        {{ formatDate(localCompletedDate) }}
      </p>
    </div>

    <!-- レビューコメント -->
    <div class="mb-6">
      <label for="reviewComment" class="block text-sm font-medium mb-2">レビュー</label>
      <textarea
        id="reviewComment"
        v-model="localReviewComment"
        placeholder="この本の感想を書いてください..."
        rows="4"
        class="w-full border rounded-md px-3 py-2 text-sm"
      />
      <p class="text-xs text-gray-500 mt-1">
        {{ localReviewComment?.length || 0 }} / 500
      </p>
    </div>

    <!-- 保存ボタン -->
    <div class="flex gap-2">
      <button
        @click="saveReview"
        :disabled="isSaving"
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
      <button
        v-if="hasReview"
        @click="clearReview"
        :disabled="isSaving"
        class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
      >
        クリア
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  bookId: string;
  rating?: number | null;
  reviewComment?: string | null;
  completedDate?: string | null;
}

interface Emits {
  (e: 'update', data: { rating: number | null; reviewComment: string | null; completedDate: string | null }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localRating = ref<number | null>(null);
const localReviewComment = ref<string | null>(null);
const localCompletedDate = ref<string | null>(null);
const isSaving = ref(false);

const hasReview = computed(() => {
  return localRating.value || localReviewComment.value || localCompletedDate.value;
});

onMounted(() => {
  localRating.value = props.rating || null;
  localReviewComment.value = props.reviewComment || null;
  localCompletedDate.value = props.completedDate || null;
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const saveReview = async () => {
  // コメントの長さを制限
  if (localReviewComment.value && localReviewComment.value.length > 500) {
    alert('レビューは500文字以内で入力してください');
    return;
  }

  isSaving.value = true;
  try {
    emit('update', {
      rating: localRating.value,
      reviewComment: localReviewComment.value,
      completedDate: localCompletedDate.value,
    });
  } finally {
    isSaving.value = false;
  }
};

const clearReview = () => {
  if (confirm('レビュー情報をクリアしますか？')) {
    localRating.value = null;
    localReviewComment.value = null;
    localCompletedDate.value = null;
    saveReview();
  }
};
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
