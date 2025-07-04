<template>
    <div class="flex justify-center items-center space-x-2 mt-8 pb-4">
        <Button variant="outline" size="icon" @click="goToPreviousPage" :disabled="currentPage === 1"
            aria-label="Previous page">
            <Icon name="left" size="16" />
        </Button>
        <form @submit.prevent="handlePageInputSubmit" class="flex items-center space-x-1">
            <span class="text-sm text-muted-foreground">Page</span>
            <input type="number" :min="1" :max="totalPages" v-model="pageInput" @blur="handlePageInputSubmit"
                class="w-16 h-8 text-center"
                :aria-label="`Current page, edit to change page. Total pages: ${totalPages}`" />
            <span class="text-sm text-muted-foreground">of {{ totalPages }}</span>
        </form>
        <Button variant="outline" size="icon" @click="goToNextPage" :disabled="currentPage === totalPages"
            aria-label="Next page">
            <Icon name="right" size="16" />
        </Button>
    </div>
</template>

<script>
import { ref } from 'vue';
import Icon from '@/components/icons.vue';
import Button from '@/components/ui/Button.vue';

export default {
    components: {
        Icon,
        Button,
    },
    props: {
        totalPages: {
            type: Number,
            required: true,
        },
        currentPage: {
            type: Number,
            required: true,
        },
    },
    emits: ['update:currentPage'],
    setup(props, { emit }) {
        const pageInput = ref(props.currentPage);

        const goToPreviousPage = () => {
            if (props.currentPage > 1) {
                emit('update:currentPage', props.currentPage - 1);
                pageInput.value = props.currentPage - 1;
            }
        };

        const goToNextPage = () => {
            if (props.currentPage < props.totalPages) {
                emit('update:currentPage', props.currentPage + 1);
                pageInput.value = props.currentPage + 1;
            }
        };

        const handlePageInputSubmit = () => {
            const page = Math.min(Math.max(parseInt(pageInput.value, 10) || 1, 1), props.totalPages);
            emit('update:currentPage', page);
            pageInput.value = page;
        };

        return {
            pageInput,
            goToPreviousPage,
            goToNextPage,
            handlePageInputSubmit,
        };
    },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>