<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">
      <p v-if="isEditMode">編集</p>
      <p v-else>新規</p>
    </h1>
    <form @submit.prevent="handleSubmit" class="grid gap-4">
      <div>
        <label for="title" class="text-sm font-medium leading-none">Title</label>
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
        <label for="author" class="text-sm font-medium leading-none">Author</label>
        <AutoComplete
          id="author"
          :model-value="author"
          :options="authorOptions"
          @update:model-value="author = $event; handleAuthorInput()"
          placeholder="著者を検索"
        />
      </div>
      <div>
        <label for="publisher" class="text-sm font-medium leading-none">Publisher</label>
        <AutoComplete
          id="publisher"
          :model-value="publisher"
          :options="publisherOptions"
          @update:model-value="publisher = $event; handlePublisherInput()"
          placeholder="出版社を検索"
        />
      </div>
      <div>
        <label for="series" class="text-sm font-medium leading-none">Series</label>
        <AutoComplete
          id="series"
          :model-value="series"
          :options="seriesOptions"
          @update:model-value="series = $event; handleSeriesInput()"
          placeholder="シリーズを検索"
        />
      </div>
      <div>
        <label for="isbn" class="text-sm font-medium leading-none">ISBN</label>
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
        <label for="releaseDate" class="text-sm font-medium leading-none">Release Date</label>
        <input
          type="date"
          id="releaseDate"
          v-model="releaseDate"
          class="border rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <label for="volume" class="text-sm font-medium leading-none">Volume</label>
        <input
          type="number"
          id="volume"
          v-model="volume"
          min="1"
          class="border rounded-md px-3 py-2 w-full"
        />
      </div>
      <div>
        <label for="readStatus" class="text-sm font-medium leading-none">readStatus</label>
        <select v-model="readStatus" class="border rounded-md px-3 py-2 w-full">
          <option value="" disabled>Select readStatus</option>
          <option v-for="status in readStatusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
      <div>
        <label for="bookType" class="text-sm font-medium leading-none">bookType</label>
        <select v-model="bookType" class="border rounded-md px-3 py-2 w-full">
          <option value="" disabled>Select bookType</option>
          <option v-for="bookType in bookTypeOptions" :key="bookType.value" :value="bookType.value">
            {{ bookType.label }}
          </option>
        </select>
      </div>
      <div class="flex gap-4">
        <!-- Submitボタン -->
        <Button type="submit" variant="secondary">
          {{ isEditMode ? "Update Book" : "Add Book" }}
        </Button>
        <!-- キャンセルボタン -->
        <Button type="button" variant="ghost" @click="cancel">
          キャンセル
        </Button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
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
    const isEditMode = ref(false); // 編集モードかどうかを判定

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

    // 日付を yyyy-MM-dd フォーマットに変換する関数
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // 編集モードの場合、既存のデータを取得
    onMounted(async () => {
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
        } catch (error) {
          console.error("書籍データの取得中にエラーが発生しました:", error);
        }
      }
    });

    const handleSubmit = async () => {
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
      bookTypeOptions,
      readStatusOptions,
      authorOptions,
      publisherOptions,
      seriesOptions,
      handleSubmit,
      cancel,
      isEditMode,
      handleTitleInput,
      handleSelectTitleSuggestion,
      handleAuthorInput,
      handlePublisherInput,
      handleSeriesInput,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>