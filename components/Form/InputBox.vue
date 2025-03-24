<template>
  <div class="px-[8px] lg:py-[12px]">
    <label class="hidden lg:block" :for="id">{{ label }}</label>
    <div class="py-[8px]">
      <input
        :type="type"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :maxlength="maxlength"
        v-model="inputValue"
        @input="onInput"
        class="input-box w-[280px] h-[35px] rounded-[5px] border-solid border-2"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

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
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);

    const onInput = (event) => {
      emit('update:modelValue', event.target.value);
    };

    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue;
    });

    return {
      inputValue,
      onInput
    };
  }
};
</script>

<style scoped>
@media (max-width: 559px) {
  .input-box {
    width: 100%;
  }
}
</style>
