<template>
  <div
    class="flex justify-between items-center w-[120px] relative  @sm:@max-md:w-[99px] @sm:@max-md:h-[53px] @sm:@max-md:gap-0.5">
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
