<template>
  <div class="px-[8px] py-[12px]">
    <label :for="id">{{ label }}</label>
    <div class="py-[8px]">
      <input :type="type" :id="id" :name="name" :placeholder="placeholder" :maxlength="maxlength" v-model="inputValue"
        class="w-[280px] h-[35px] rounded-[5px] border-solid border-2" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    name: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    maxlength: {
      type: Number,
      default: 100
    }
  },
  setup(props) {
    const inputValue = ref('');
    return {
      inputValue
    };
  }
};
</script>
