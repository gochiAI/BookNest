<template>
  <div>
    <!-- ボタンをクリックするとダイアログを表示 -->
    <button @click="openModal" class="bg-blue-500 text-white px-4 py-2 rounded">Add Book</button>

    <!-- ダイアログのオーバーレイ -->
    <dialog id="bookModal" class="modal bg-white shadow sm:rounded-lg">
      <div class="modal-box px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Add Book</h3>
        <button @click="closeModal" class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700">
          <span class="sr-only">Close</span>
          &times;
        </button>
        <form @submit.prevent="addBook" class="mt-5 space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" v-model="bookData.title" required
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="author" class="block text-sm font-medium text-gray-700">Author</label>
            <input type="text" id="author" v-model="bookData.author.name" required
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="bookTypeId" class="block text-sm font-medium text-gray-700">Book Type</label>
            <select id="bookTypeId" v-model="bookData.bookTypeId" required
              class="select select-primary select-sm w-full text-base rounded-md">
              <option v-for="option in bookTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label for="readStatusId" class="block text-sm font-medium text-gray-700">Read Status</label>
            <select id="readStatusId" v-model="bookData.readStatusId" required
              class="select select-primary select-sm w-full text-base rounded-md">
              <option v-for="option in readStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label for="releaseDate" class="block text-sm font-medium text-gray-700">Release Date</label>
            <input type="date" id="releaseDate" v-model="bookData.releaseDate"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="cover" class="block text-sm font-medium text-gray-700">Cover URL</label>
            <input type="url" id="cover" v-model="bookData.cover"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="volume" class="block text-sm font-medium text-gray-700">Volume</label>
            <input type="number" id="volume" v-model="bookData.volume" min="1"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="isbn" class="block text-sm font-medium text-gray-700">ISBN</label>
            <input type="text" id="isbn" v-model="bookData.isbn"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="publisher" class="block text-sm font-medium text-gray-700">Publisher</label>
            <input type="text" id="publisher" v-model="bookData.publisher.name"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div>
            <label for="series" class="block text-sm font-medium text-gray-700">Series</label>
            <input type="text" id="series" v-model="bookData.series.name"
              class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeModal" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add' }}
            </button>
          </div>
        </form>
        <div v-if="errorMessage" class="mt-4 text-red-600">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mt-4 text-green-600">
          {{ successMessage }}
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getBookTypeOptions, getReadStatusOptions } from '../config/bookOptions';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const bookData = ref({
  title: '',
  author: { name: '' },
  publisher: { name: '' },
  bookTypeId: '',
  readStatusId: '',
  releaseDate: '',
  cover: '',
  volume: null,
  isbn: '',
  series: { name: '' }
});

// bookOptions.tsから取得
const bookTypeOptions = getBookTypeOptions(t);
const readStatusOptions = getReadStatusOptions(t);

const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const openModal = () => {
  document.getElementById('bookModal').showModal();
};

const closeModal = () => {
  document.getElementById('bookModal').close();
};

const addBook = async () => {
  isSubmitting.value = true;
  try {
    const response = await fetch('/api/bookCrud', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add book');
    }

    successMessage.value = 'Book added successfully!';
    bookData.value = {
      title: '',
      author: { name: '' },
      publisher: { name: '' },
      bookTypeId: '',
      readStatusId: '',
      releaseDate: '',
      cover: '',
      volume: null,
      isbn: '',
      series: { name: '' }
    };
    closeModal();
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>