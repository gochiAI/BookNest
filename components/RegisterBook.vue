<template>
    <dialog class="modal bg-white shadow sm:rounded-lg" id="my_modal_1">
        <div class="modal-box px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Register a New Book</h3>
            <button @click="closeModal" class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700">
                <span class="sr-only">Close</span>
                &times;
            </button>
            <form @submit.prevent="registerBook" class="mt-5 space-y-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" v-model="book.title" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        @input="checkTitle">
                </div>

                <div>
                    <label for="authorName" class="block text-sm font-medium text-gray-700">Author</label>
                    <input type="text" name="authorName" id="authorName" v-model="book.authorName" required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                </div>

                <div>
                    <label for="publisherName" class="block text-sm font-medium text-gray-700">Publisher</label>
                    <input type="text" name="publisherName" id="publisherName" v-model="book.publisherName" required
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="seriesName" class="block text-sm font-medium text-gray-700">Series (optional)</label>
                    <input type="text" name="seriesName" id="seriesName" v-model="book.seriesName"
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="volume" class="block text-sm font-medium text-gray-700">Volume (optional)</label>
                    <input type="number" name="volume" id="volume" v-model="book.volume" min="1"
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="isbn" class="block text-sm font-medium text-gray-700">ISBN (optional)</label>
                    <input type="text" name="isbn" id="isbn" v-model="book.isbn"
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="releaseDate" class="block text-sm font-medium text-gray-700">Release Date
                        (optional)</label>
                    <input type="date" name="releaseDate" id="releaseDate" v-model="book.releaseDate"
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="cover" class="block text-sm font-medium text-gray-700">Cover URL (optional)</label>
                    <input type="url" name="cover" id="cover" v-model="book.cover"
                        class="input input-bordered input-sm input-primary mt-1  block w-full shadow-sm sm:text-sm rounded-md">
                </div>

                <div>
                    <label for="bookTypeId" class="block text-sm font-medium text-gray-700">Book Type</label>
                    <select id="bookTypeId" name="bookType" v-model="book.bookTypeId" required
                        class="select select-primary select-sm w-full text-baserounded-md">
                        <option v-for="bookType in bookTypeOptions" :key="bookType.value" :value="bookType.value">
                            {{ bookType.label }}
                        </option>
                    </select>
                </div>

                <div>
                    <label for="readStatusId" class="block text-sm font-medium text-gray-700">Read Status</label>
                    <select id="readStatusId" name="readStatusId" v-model="book.readStatusId" required
                        class="select select-primary select-sm w-full text-baserounded-md">
                        <option v-for="readStatus in readStatusOptions" :key="readStatus.value"
                            :value="readStatus.value">
                            {{ readStatus.label }}
                        </option>
                    </select>
                </div>

                <div>
                    <button type="submit"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        :disabled="isSubmitting">
                        {{ isSubmitting ? 'Registering...' : 'Register Book' }}
                    </button>
                </div>
            </form>
            <button @click="closeModal" >
                Close
            </button>
            <div v-if="errorMessage" class="mt-4 text-red-600">
                {{ errorMessage }}
            </div>

            <!-- Success message -->
            <div v-if="successMessage" class="mt-4 text-green-600">
                {{ successMessage }}
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { bookTypeOptions, readStatusOptions } from '~/config/TypeSelect'
import { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const book = ref({
    title: '',
    authorName: '',
    publisherName: '',
    seriesName: '',
    volume: null,
    isbn: '',
    releaseDate: '',
    cover: '',
    bookTypeId: '',
    readStatusId: ''
})
const searchResults = ref({
    source: '',
    books: []
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const toast = useToast();

const checkTitle = async () => {
    if (book.value.title.length > 2) {
        try {
            const response = await fetch(`/api/books/search?title=${encodeURIComponent(book.value.title)}`)
            if (!response.ok) {
                throw new Error('Failed to check title')
            }
            const data = await response.json()
            searchResults.value = {
                source: 'external',
                books: data.books
            }
        } catch (error) {
            errorMessage.value = 'Failed to check title'
        } finally {
            console.log('searchResults:', searchResults.value)
        }
    }
}

const fetchBookInfoFromExternalAPI = async () => {
    // 外部APIから書籍情報を取得するロジックをここに追加
    // 例: 国立図書館、版元ドットコム、Amazonなど
}

const registerBook = async () => {
    try {
        console.log('Registering book:', book.value)
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book.value),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to register book')
        }

        const newBook = await response.json()
        console.log('Book registered successfully:', newBook)
        successMessage.value = 'Book registered successfully'
        toast.success(successMessage.value);

        // Reset the form
        book.value = {
            title: '',
            authorName: '',
            publisherName: '',
            seriesName: '',
            volume: null,
            isbn: '',
            releaseDate: '',
            cover: '',
            bookTypeId: '',
            readStatusId: ''
        }

        // Redirect to the book list or show a success message

    } catch (error) {
        console.error('Error registering book:', error)
        errorMessage.value = error.message || 'An error occurred while registering the book. Please try again.'
        toast.error(errorMessage.value);
        // Here you would typically show an error message to the user
    } finally {
        isSubmitting.value = false
    }
}
watch(searchResults, (newVal) => {
    if (newVal.books.length > 0) {
        const matchedBook = newVal.books.pop()
        console.log('Matched book:', matchedBook)
        book.value.title = matchedBook.title
        book.value.publisherName = matchedBook.publisher?.name
        book.value.authorName = matchedBook.author?.name
        book.value.seriesName = matchedBook.series?.name
        book.value.volume = matchedBook.volume + 1
        book.value.bookTypeId = matchedBook.bookTypeId
    }
})

const closeModal = () => {
    document.getElementById('my_modal_1').close();
}
</script>