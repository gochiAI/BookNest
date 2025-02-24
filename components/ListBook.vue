<template>
    <div class="list" @contextmenu.prevent="showContextMenu($event, book)">
        <img :src="book.cover || './place.png'" alt="Book Cover" />
        <div>
            <h1>{{ book.title }}</h1>
            <p>{{ book.series.name }}</p>
            <h2>{{ book.author.name }}</h2>
            <h2>{{ book.volume }}</h2>
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
.list {
    display: flex;
    align-items: center;
    position: relative;
    gap: 5rem;
}

.list img {
    width: 150px;
    height: 230px;
    pointer-events: none;
}

.list div {
    display: flex;
    flex-direction: column;
}

.list h1 {
    font-size: 1.5rem;
    font-weight: bold;
}

.list h2 {
    font-size: 1.25rem;
}

.list p {
    background-color: rgba(131, 133, 133, 0.196);
    font-size: 1rem;
    padding: 0.5rem;
}

@media screen and (max-width: 768px) {
    .list {
        gap: 1rem;
    }
    .list img {
        width: 100px;
        height: 150px;
    }
}
</style>