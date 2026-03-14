<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">
      <p v-if="isEditMode">編集</p>
      <p v-else>新規</p>
    </h1>
    <form @submit.prevent="handleSubmit" class="grid gap-4">
      <div>
        <label for="title" class="text-sm font-medium leading-none">Title
          <span v-if="isRequired('title')" class="text-red-500 ml-1">*</span>
        </label>
        <TitleSuggestions
          id="title"
          :model-value="title"
          :author-options="authorOptions"
          :series-options="seriesOptions"
          @update:model-value="title = $event; handleTitleInput()"
          @select-suggestion="handleSelectTitleSuggestion"
        />
      </div>
      <div>
        <label for="author" class="text-sm font-medium leading-none">Author
          <span v-if="isRequired('authorNames')" class="text-red-500 ml-1">*</span>
        </label>
        <AutoComplete
          id="author"
          :model-value="author"
          :options="authorOptions"
          @update:model-value="author = $event; handleAuthorInput()"
          placeholder="著者を検索"
        />
      </div>
      <div>
        <label for="publisher" class="text-sm font-medium leading-none">Publisher
          <span v-if="isRequired('publisherName')" class="text-red-500 ml-1">*</span>
        </label>
        <AutoComplete
          id="publisher"
          :model-value="publisher"
          :options="publisherOptions"
          @update:model-value="publisher = $event; handlePublisherInput()"
          placeholder="出版社を検索"
        />
      </div>
      <div>
        <label for="series" class="text-sm font-medium leading-none">Series
          <span v-if="isRequired('seriesName')" class="text-red-500 ml-1">*
          </span>
        </label>
        <AutoComplete
          id="series"
          :model-value="series"
          :options="seriesOptions"
          @update:model-value="series = $event; handleSeriesInput()"
          placeholder="シリーズを検索"
        />
      </div>
      <div>
        <label for="isbn" class="text-sm font-medium leading-none">ISBN
          <span v-if="isRequired('isbn')" class="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="isbn"
          v-model="isbn"
          pattern="\d{13}"
          title="ISBN must be a 13-digit number"
          class="border rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <label class="text-sm font-medium leading-none">Cover</label>
        <div class="mt-2 flex items-start gap-4">
          <div class="w-24 h-32 rounded border bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            <img
              v-if="currentCoverUrl"
              :src="currentCoverUrl"
              :alt="`${title || 'book'}の書影`"
              class="w-full h-full object-cover"
              @error="handleCoverImageError"
            />
            <span v-else class="text-xs text-gray-500">No Cover</span>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                :disabled="coverStatus === 'loading'"
                @click="fetchCover"
              >
                {{ coverStatus === "loading" ? "取得中..." : "書影を取得" }}
              </Button>
              <Button
                type="button"
                variant="ghost"
                :disabled="coverStatus === 'loading' || coverCandidates.length === 0"
                @click="openCoverCandidateSelector"
              >
                候補選択
              </Button>
              <Button
                type="button"
                variant="ghost"
                :disabled="!coverUrl && !coverPreviewUrl"
                @click="clearCover"
              >
                クリア
              </Button>
            </div>
            <p v-if="coverUrl" class="text-xs text-gray-500 break-all">
              保存先: {{ coverUrl }}
            </p>
            <p v-if="coverCandidates.length > 0" class="text-xs text-gray-500">
              候補: {{ coverCandidates.length }}件
              <span v-if="currentCoverCandidate?.matchedVolume" class="text-green-700 ml-1">（巻数一致）</span>
            </p>
            <p v-if="coverStatus === 'error'" class="text-xs text-red-600">
              書影の取得または表示に失敗しました。
            </p>
            <p v-else-if="coverStatus === 'loading'" class="text-xs text-blue-600">
              書影を取得中...
            </p>
            <p v-else-if="coverSource" class="text-xs text-gray-500">
              書影ソース: {{ coverSource }}
            </p>
          </div>
        </div>
      </div>
      <div>
        <label for="releaseDate" class="text-sm font-medium leading-none">Release Date
          <span v-if="isRequired('releaseDate')" class="text-red-500 ml-1">*</span>
        </label>
        <input
          type="date"
          id="releaseDate"
          v-model="releaseDate"
          class="border rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <label for="volume" class="text-sm font-medium leading-none">Volume
          <span v-if="isRequired('volume')" class="text-red-500 ml-1">*
          </span>
        </label>
        <input
          type="number"
          id="volume"
          v-model="volume"
          min="1"
          class="border rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <label for="readStatus" class="text-sm font-medium leading-none">readStatus
          <span v-if="isRequired('readStatus')" class="text-red-500 ml-1">*
          </span>
        </label>
        <select v-model="readStatus" class="border rounded-md px-3 py-2 w-full">
          <option value="" disabled>Select readStatus</option>
          <option v-for="status in readStatusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
      <div>
        <label for="bookType" class="text-sm font-medium leading-none">bookType
          <span v-if="isRequired('bookType')" class="text-red-500 ml-1">*
          </span>
        </label>
        <select v-model="bookType" class="border rounded-md px-3 py-2 w-full">
          <option value="" disabled>Select bookType</option>
          <option v-for="bookType in bookTypeOptions" :key="bookType.value" :value="bookType.value">
            {{ bookType.label }}
          </option>
        </select>
      </div>
      <div class="flex gap-4">
        <!-- Submitボタン -->
        <Button type="submit" variant="secondary" :disabled="!isValidRequired">
          {{ isEditMode ? "Update Book" : "Add Book" }}
        </Button>
        <!-- キャンセルボタン -->
        <Button type="button" variant="ghost" @click="cancel">
          キャンセル
        </Button>
      </div>
    </form>

    <div
      v-if="showCoverCandidateSelector"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeCoverCandidateSelector"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b">
          <h3 class="text-xl font-bold">書影候補を選択してください</h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ title }}
            <span v-if="volume">Vol.{{ volume }}</span>
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-3">
            <div
              v-for="(candidate, index) in coverCandidates"
              :key="`${candidate.remoteUrl}-${index}`"
              class="border rounded-lg p-4 transition-colors"
              :class="[
                candidate.remoteUrl === selectedCoverRemoteUrl
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50 hover:border-blue-300 cursor-pointer'
              ]"
              @click="selectCoverCandidate(candidate)"
            >
              <div class="flex items-start gap-4">
                <div class="w-14 h-20 rounded border bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    :src="candidate.previewUrl || candidate.remoteUrl"
                    :alt="candidate.title || title"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="font-medium text-sm">{{ candidate.title || title || 'タイトル不明' }}</p>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ candidate.source }}</span>
                  </div>
                  <p v-if="candidate.volume" class="text-xs text-gray-600 mt-1">候補巻数: Vol.{{ candidate.volume }}</p>
                  <p v-if="candidate.isbn" class="text-xs text-gray-600 mt-1">ISBN: {{ candidate.isbn }}</p>
                  <p v-if="candidate.matchedVolume" class="text-xs text-green-700 mt-1">巻数一致候補</p>
                  <p v-if="candidate.remoteUrl === selectedCoverRemoteUrl" class="text-xs text-blue-700 mt-1">現在選択中</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t bg-gray-50 flex justify-end gap-2">
          <Button type="button" variant="outline" :disabled="isSelectingCoverCandidate" @click="closeCoverCandidateSelector">
            閉じる
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/ui/Button.vue";
import AutoComplete from "@/components/AutoComplete.vue";
import TitleSuggestions from "@/components/TitleSuggestions.vue";
import { BookType, ReadStatus } from "@/constants/book.ts";

export default {
  components: {
    Button,
    AutoComplete,
    TitleSuggestions,
  },
  setup() {
    const router = useRouter();

    const title = ref("");
    const author = ref("");
    const publisher = ref("");
    const series = ref("");
    const isbn = ref("");
    const releaseDate = ref("");
    const readStatus = ref("");
    const bookType = ref("");
    const volume = ref(null);
    const coverUrl = ref("");
    const coverPreviewUrl = ref("");
    const coverSource = ref("");
    const coverStatus = ref("");
    const coverCandidates = ref([]);
    const selectedCoverRemoteUrl = ref("");
    const showCoverCandidateSelector = ref(false);
    const isSelectingCoverCandidate = ref(false);
    const isEditMode = ref(false); // 編集モードかどうかを判定
    const customization = ref(null);
    const requiredOnCreate = computed(() => customization.value?.registration?.requiredOnCreate || []);
    const isRequired = (key) => requiredOnCreate.value.includes(key);
    const currentCoverUrl = computed(() => coverPreviewUrl.value || coverUrl.value);
    const currentCoverCandidate = computed(() =>
      coverCandidates.value.find(candidate => candidate.remoteUrl === selectedCoverRemoteUrl.value),
    );

    const isValidRequired = computed(() => {
      // Map UI fields to config keys
      const required = new Set(requiredOnCreate.value);
      // title
      if (required.has('title') && (!title.value || title.value.trim() === '')) return false;
      // authorNames
      if (required.has('authorNames') && (!author.value || author.value.trim() === '')) return false;
      // bookType
      if (required.has('bookType') && (!bookType.value || bookType.value.trim() === '')) return false;
      // readStatus
      if (required.has('readStatus') && (!readStatus.value || readStatus.value.trim() === '')) return false;
      // publisherName
      if (required.has('publisherName') && (!publisher.value || publisher.value.trim() === '')) return false;
      // seriesName
      if (required.has('seriesName') && (!series.value || series.value.trim() === '')) return false;
      // isbn
      if (required.has('isbn') && (!isbn.value || isbn.value.trim() === '')) return false;
      // releaseDate
      if (required.has('releaseDate') && (!releaseDate.value || releaseDate.value.trim() === '')) return false;
      // volume (number)
      if (required.has('volume') && (volume.value === null || volume.value === undefined)) return false;
      return true;
    });

    // 本の種類のオプション
    const bookTypeOptions = Object.values(BookType).map((type) => ({
      label: type,
      value: type,
    }));

    // 読書状況のオプション
    const readStatusOptions = Object.values(ReadStatus).map((status) => ({
      label: status,
      value: status,
    }));

    // 自動補完用のオプション（ダミーデータ）
    const authorOptions = ref([]);
    const publisherOptions = ref([]);
    const seriesOptions = ref([]);

    // APIから自動補完候補を取得
    const fetchAutocompleteSuggestions = async (query, type = 'all') => {
      if (!query || query.length < 1) {
        return { authors: [], series: [], publishers: [] };
      }
      try {
        const url = type === 'all' 
          ? `/api/autocomplete?query=${encodeURIComponent(query)}`
          : `/api/autocomplete?query=${encodeURIComponent(query)}&type=${type}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('自動補完候補の取得に失敗しました:', error);
        return { authors: [], series: [], publishers: [] };
      }
    };

    // タイトルの入力時に著者とシリーズの候補を更新
    const handleTitleInput = async () => {
      const data = await fetchAutocompleteSuggestions(title.value, 'by-title');
      authorOptions.value = data.authors;
      seriesOptions.value = data.series;
    };

    // タイトル候補から選択した時のハンドラー
    const handleSelectTitleSuggestion = (suggestion) => {
      if (suggestion.type === 'author' && suggestion.authors && suggestion.authors[0]) {
        author.value = suggestion.authors[0];
      } else if (suggestion.type === 'series' && suggestion.series && suggestion.series[0]) {
        series.value = suggestion.series[0];
      }
    };

    // 著者の入力時に候補を更新
    const handleAuthorInput = async () => {
      const data = await fetchAutocompleteSuggestions(author.value, 'author');
      authorOptions.value = data.authors;
    };

    // 出版社の入力時に候補を更新
    const handlePublisherInput = async () => {
      const data = await fetchAutocompleteSuggestions(publisher.value, 'publisher');
      publisherOptions.value = data.publishers;
    };

    // シリーズの入力時に候補を更新
    const handleSeriesInput = async () => {
      const data = await fetchAutocompleteSuggestions(series.value, 'series');
      seriesOptions.value = data.series;
    };

    const normalizeIsbn = (value) => (value || "").replace(/\D/g, "");

    const applyCoverResponse = (data) => {
      if (Array.isArray(data?.candidates) && data.candidates.length > 0) {
        coverCandidates.value = data.candidates;
      }

      if (data?.coverUrl) {
        coverUrl.value = data.coverUrl;
        coverPreviewUrl.value = `${data.coverUrl}${data.coverUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
        coverSource.value = data.source || "";
        selectedCoverRemoteUrl.value = data.remoteUrl || "";
        coverStatus.value = "done";
        return true;
      }

      coverPreviewUrl.value = "";
      coverStatus.value = "error";
      return false;
    };

    const fetchCover = async () => {
      const normalizedIsbn = normalizeIsbn(isbn.value);
      const normalizedTitle = (title.value || "").trim();
      if (!normalizedIsbn && !normalizedTitle) {
        alert("ISBNまたはタイトルを入力してください");
        return;
      }

      const shouldForce = coverStatus.value === "error";
      coverStatus.value = "loading";
      try {
        const response = await fetch("/api/bookCrud/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isbn: normalizedIsbn || undefined,
            title: normalizedTitle || undefined,
            volume: volume.value ?? undefined,
            force: shouldForce,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cover image");
        }

        const data = await response.json();
        if (!applyCoverResponse(data)) {
          coverSource.value = "";
          if ((data?.candidates?.length || 0) > 0) {
            alert("候補は見つかりました。候補選択から選んでください。");
          } else {
            alert("書影が見つかりませんでした");
          }
        }
      } catch (error) {
        coverPreviewUrl.value = "";
        coverSource.value = "";
        coverStatus.value = "error";
        console.error("書影の取得中にエラーが発生しました:", error);
        alert("書影の取得に失敗しました");
      }
    };

    const openCoverCandidateSelector = () => {
      if (coverCandidates.value.length === 0) return;
      showCoverCandidateSelector.value = true;
    };

    const closeCoverCandidateSelector = () => {
      if (isSelectingCoverCandidate.value) return;
      showCoverCandidateSelector.value = false;
    };

    const selectCoverCandidate = async (candidate) => {
      if (!candidate?.remoteUrl) return;

      const normalizedIsbn = normalizeIsbn(isbn.value);
      const normalizedTitle = (title.value || "").trim();
      const shouldForce = coverStatus.value === "error";

      isSelectingCoverCandidate.value = true;
      coverStatus.value = "loading";

      try {
        const response = await fetch("/api/bookCrud/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isbn: normalizedIsbn || undefined,
            title: normalizedTitle || undefined,
            volume: volume.value ?? undefined,
            candidateUrl: candidate.remoteUrl,
            candidateSource: candidate.source,
            force: shouldForce,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to apply cover candidate");
        }

        const data = await response.json();
        if (!applyCoverResponse(data)) {
          alert("候補の適用に失敗しました");
        } else {
          selectedCoverRemoteUrl.value = candidate.remoteUrl;
          showCoverCandidateSelector.value = false;
        }
      } catch (error) {
        coverStatus.value = "error";
        coverPreviewUrl.value = "";
        console.error("書影候補の適用中にエラーが発生しました:", error);
        alert("書影候補の適用に失敗しました");
      } finally {
        isSelectingCoverCandidate.value = false;
      }
    };

    const clearCover = () => {
      coverUrl.value = "";
      coverPreviewUrl.value = "";
      coverSource.value = "";
      coverStatus.value = "";
      coverCandidates.value = [];
      selectedCoverRemoteUrl.value = "";
      showCoverCandidateSelector.value = false;
    };

    const handleCoverImageError = () => {
      coverPreviewUrl.value = "";
      coverStatus.value = "error";
    };

    // 日付を yyyy-MM-dd フォーマットに変換する関数
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const loadCustomization = async () => {
      try {
        const res = await fetch('/api/settings/customization');
        const json = await res.json();
        customization.value = json.data;
      } catch (e) {
        customization.value = null;
      }
    };

    // 編集モードの場合、既存のデータを取得
    onMounted(async () => {
      await loadCustomization();
      const bookId = sessionStorage.getItem("x-book-id");
      if (bookId) {
        isEditMode.value = true;
        try {
          const response = await fetch(`/api/bookCrud`, {
            method: "GET",
            headers: { "x-book-id": bookId },
          });
          if (!response.ok) throw new Error("Failed to fetch book data");
          const book = await response.json();
          title.value = book.title;
          author.value = book.authors?.[0]?.author?.name ?? "";
          publisher.value = book.publisher?.name ?? "";
          series.value = book.series?.name ?? "";
          isbn.value = book.isbn || "";
          releaseDate.value = book.releaseDate ? formatDate(book.releaseDate) : "";
          readStatus.value = book.readStatus;
          bookType.value = book.bookType;
          volume.value = book.volume ?? null;
          coverUrl.value = book.coverUrl || "";
          coverPreviewUrl.value = "";
          coverSource.value = "";
          coverStatus.value = book.coverUrl ? "done" : "";
          coverCandidates.value = [];
          selectedCoverRemoteUrl.value = "";
        } catch (error) {
          console.error("書籍データの取得中にエラーが発生しました:", error);
        }
      }
    });

    const handleSubmit = async () => {
      // Client-side guard using customization
      if (!isValidRequired.value) {
        alert('必須項目を入力してください');
        return;
      }
      const newBook = {
        title: title.value,
        authorNames: author.value ? [author.value] : [],
        publisherName: publisher.value || undefined,
        seriesName: series.value || undefined,
        isbn: isbn.value || null,
        releaseDate: releaseDate.value || null,
        readStatus: readStatus.value || "Unread",
        bookType: bookType.value || "General",
        volume: volume.value ?? null,
        coverUrl: coverUrl.value || undefined,
      };

      try {
        const method = isEditMode.value ? "PUT" : "POST";
        const response = await fetch(`/api/bookCrud`, {
          method,
          headers: {
            "Content-Type": "application/json",
            "x-book-id": isEditMode.value ? sessionStorage.getItem("x-book-id") || "" : "",
          },
          body: JSON.stringify(newBook),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(method === "PUT" ? "Failed to update book" : "Failed to create book");
        }

        sessionStorage.removeItem("x-book-id");
        router.push("/");
      } catch (error) {
        console.error(
          isEditMode.value
            ? "書籍の更新中にエラーが発生しました:"
            : "書籍の登録中にエラーが発生しました:",
          error
        );
      }
    };

    const cancel = () => {
      sessionStorage.removeItem("x-book-id"); // ヘッダー情報を削除
      router.push("/"); // 一覧ページにリダイレクト
    };

    return {
      title,
      author,
      publisher,
      series,
      isbn,
      releaseDate,
      readStatus,
      bookType,
      volume,
      coverUrl,
      coverPreviewUrl,
      coverSource,
      coverStatus,
      coverCandidates,
      selectedCoverRemoteUrl,
      showCoverCandidateSelector,
      isSelectingCoverCandidate,
      currentCoverUrl,
      currentCoverCandidate,
      bookTypeOptions,
      readStatusOptions,
      authorOptions,
      publisherOptions,
      seriesOptions,
      handleSubmit,
      cancel,
      isEditMode,
      customization,
      isRequired,
      isValidRequired,
      handleTitleInput,
      handleSelectTitleSuggestion,
      handleAuthorInput,
      handlePublisherInput,
      handleSeriesInput,
      fetchCover,
      openCoverCandidateSelector,
      closeCoverCandidateSelector,
      selectCoverCandidate,
      clearCover,
      handleCoverImageError,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
