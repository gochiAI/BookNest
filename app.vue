<template>
  <div class="container mx-auto px-4 py-8">
    <div id="header">
    <Frame4 :readStatus="readStatus" :bookType="bookType" :search="search" />
    <Frame5 />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Frame4 from './components/Frame4.vue';
import Frame5 from './components/Frame5.vue';


const readStatus = ref('all');
const bookType = ref('all');
const search = ref('');

</script>
<style scoped>
#header {
    /* デフォルトの背景色 */
    background-color: white;
    

}

@media (max-width: 1022px) {
    #header {
        /* スマホの時の背景色 */
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        background-color: #D9D9D9;
    }
}

@media (max-width: 559px) {
    #header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>