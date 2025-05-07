<template>
    <div class="flex gap-4  m-[0.5rem]">
        <!-- 本の種類のプルダウン -->
        <Pulldown :options="bookTypeOptions" v-model="selectedBookType" class="w-[45%]">
            <template #prefix>
                <Icon name="booktype" size="20" class="text-muted-foreground" />
            </template>
        </Pulldown>
        <!-- 読書状況のプルダウン -->
        <Pulldown :options="readStatusOptions" v-model="selectedReadStatus" class="w-[45%]" >
            <template #prefix>
                <Icon name="readstatus" size="20" class="text-muted-foreground" />
            </template>
        </Pulldown>
    </div>
</template>

<script setup>
import Icon from "@/components/icons.vue";
import Pulldown from "@/components/ui/Pulldown.vue";
import { BookType, ReadStatus } from "@/constants/book.ts";
import { ref } from "vue";


// 本の種類のオプション
const bookTypeOptions = Object.values(BookType).map((type) => ({
    label: type,
    value: type,
}));
bookTypeOptions.unshift({ label: 'All', value: "" });


// 読書状況のオプション
const readStatusOptions = Object.values(ReadStatus).map((status) => ({
    label: status,
    value: status,
}));
readStatusOptions.unshift({ label: 'All', value: "" });

const selectedBookType = defineModel('bookType');
const selectedReadStatus = defineModel('readStatus');

</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>