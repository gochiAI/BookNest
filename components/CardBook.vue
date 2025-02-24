<template>
    <div class="card" @contextmenu.prevent="showContextMenu($event, book)">
        <img :src="book.cover || './place.png'" alt="Book Cover" />
        <div>
            <p>{{ book.title }}</p>
            <p>{{ book.author.name }}</p>
            <p>{{ book.volume }}</p>
        </div>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';


const props = defineProps({
    book: {
        type: Object,
        required: true
    }
});


</script>

<style scoped>
.card {
    display: flex;
    align-items: center;
    position: relative;
}
.card img {
    pointer-events: none;
}
.card div {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 0;
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
}
</style>