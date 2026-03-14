<template>
  <div
    class="rounded-lg border bg-card text-card-foreground shadow-sm"
  >
    <!-- ヘッダー -->
    <div v-if="$slots.header || $slots['header-action']" class="flex items-center justify-between p-6">
      <div class="flex flex-col space-y-1.5">
        <slot name="header" />
      </div>
      <div v-if="$slots['header-action']">
        <slot name="header-action" />
      </div>
    </div>

    <!-- コンテンツ -->
    <div v-if="$slots.content" class="p-6 pt-0">
      <slot name="content" />
    </div>

    <!-- フッター -->
    <div v-if="$slots.footer" class="flex items-center p-6 pt-0">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {},
  emits: [],
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
/* メニューのスタイルを調整 */
.absolute {
  position: absolute;
}
</style>