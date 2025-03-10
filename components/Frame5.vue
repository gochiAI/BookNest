<template>
  <div
    class="flex justify-between items-center w-[120px] relative  @sm:w-[99px] @sm:h-[53px] @sm:gap-0.5">
    <Button type="icon" iconName="my-icon:layout-change" iconSize="29px" />
    <Button type="icon" iconName="my-icon:sort" iconSize="29px" />
    <Button type="icon" iconName="my-icon:inbox-setting" iconSize="29px" />
  </div>
</template>

<script>
import Button from './Childs/Button.vue';


export default {
  components: {
    Button,
  }
};
</script>
