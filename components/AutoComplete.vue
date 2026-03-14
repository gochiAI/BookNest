<template>
  <div class="relative w-full">
    <input
      type="text"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      class="autocomplete-input"
    />
    <ul v-if="showOptions && filteredOptions.length > 0" class="autocomplete-list">
      <li v-for="option in filteredOptions" :key="option" @click="selectOption(option)">
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Search...'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const showOptions = ref(false);

    // optionsが更新されたときに候補リストを表示
    watch(() => props.options, (newOptions) => {
      if (newOptions && newOptions.length > 0 && props.modelValue.length > 0) {
        showOptions.value = true;
      }
    });

    // modelValueが更新されたときもチェック
    watch(() => props.modelValue, (newValue) => {
      if (newValue && newValue.length > 0 && props.options.length > 0) {
        showOptions.value = true;
      }
    });

    // クエリが変更されたときにオプションをフィルタリング
    const filteredOptions = computed(() => {
      if (!props.modelValue || props.modelValue.length < 1 || !props.options.length) {
        return [];
      }
      return props.options.filter(option =>
        option.toLowerCase().includes(props.modelValue.toLowerCase())
      );
    });

    const handleInput = (event) => {
      const value = event.target.value;
      emit('update:modelValue', value);
      // 入力時は常にリストを表示
      if (value.length > 0 && props.options.length > 0) {
        showOptions.value = true;
      }
    };

    const selectOption = (option) => {
      emit('update:modelValue', option);
      showOptions.value = false;
    };

    const handleFocus = () => {
      // フォーカス時にフィルタ済み候補がある場合は表示
      if (props.modelValue.length > 0 && filteredOptions.value.length > 0) {
        showOptions.value = true;
      } else if (props.modelValue.length === 0 && props.options.length > 0) {
        // 空の場合でも全候補を表示する場合はここで設定
        showOptions.value = false;
      }
    };

    const handleBlur = () => {
      // リストをクリックする時間を確保するため、遅延をつける
      setTimeout(() => {
        showOptions.value = false;
      }, 200);
    };

    return {
      showOptions,
      filteredOptions,
      selectOption,
      handleInput,
      handleFocus,
      handleBlur
    };
  }
};
</script>

<style scoped>
.autocomplete-input {
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  padding: 0.75rem;
  width: 100%;
  font-size: 1rem;
}

.autocomplete-input:focus {
  outline: none;
  border-color: #999;
}

.autocomplete-list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 0.25rem;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  z-index: 10;
}

.autocomplete-list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
  border-bottom: none;
}

.autocomplete-list li:hover {
  background-color: #f5f5f5;
}
</style>
