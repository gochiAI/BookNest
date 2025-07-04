<template>
  <div>
    <label v-if="label" :for="id" class="block mb-2 text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      :type="type"
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :maxlength="maxlength"
      v-model="inputValue"
      @input="onInput"
      :class="inputClass"
      :disabled="disabled"
    />
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    name: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: 100,
    },
    modelValue: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);

    const onInput = (event) => {
      emit('update:modelValue', event.target.value);
    };

    watch(
      () => props.modelValue,
      (newValue) => {
        inputValue.value = newValue;
      }
    );

    const inputClass = computed(() =>
      [
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        props.className,
      ].join(' ')
    );

    return {
      inputValue,
      onInput,
      inputClass,
    };
  },
};
</script>

<style scoped>
/* メディアクエリでレスポンシブ対応 */
@media (max-width: 559px) {
  input {
    width: 100%;
  }
}
</style>
