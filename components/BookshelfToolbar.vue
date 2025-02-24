<template>
    <Group direction="row" align="center">
        <Frame4
            :readStatus="readStatus"
            :bookType="bookType"
            :search="search"
            @updateReadStatus="updateReadStatus"
            @updateBookType="updateBookType"
            @updateSearch="updateSearch"/>
        <Frame5 />
    </Group>
</template>
<script>
import Group from './Childs/Group.vue';
import Frame4 from './Frame4.vue';
import Frame5 from './Frame5.vue';

export default {
  components: {
    Group,
    Frame4,
    Frame5
  }
};
</script>
<style scoped>
</style>