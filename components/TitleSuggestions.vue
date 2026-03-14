<template>
  <div class="title-suggestions-wrapper">
    <input
      ref="inputEl"
      type="text"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      placeholder="タイトルを検索"
      class="title-input"
    />
    
    <!-- 候補を表示するポップアップ -->
    <div v-if="showSuggestions && isFocused && suggestions.length > 0" class="suggestions-popup">
      <div class="suggestions-header">
        <h4>{{ suggestions.length }}件の候補</h4>
        <button type="button" class="apply-all-button" @mousedown.prevent @click="applyAllSuggestions">
          すべて適用
        </button>
      </div>
      <div class="suggestions-grid">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          type="button"
          class="suggestion-button"
          :variant="suggestion.type === 'author' ? 'default' : 'secondary'"
          @mousedown.prevent
          @click="selectSuggestion(suggestion)"
        >
          <span v-if="suggestion.authors" class="suggestion-label">著者</span>
          <span v-else class="suggestion-label">シリーズ</span>
          <span class="suggestion-text">{{ suggestion.authors ? suggestion.authors[0] : suggestion.series ? suggestion.series[0] : '' }}</span>
        </button>
      </div>
    </div>
    
    <!-- 候補がない場合 -->
    <div v-else-if="showSuggestions && isFocused && modelValue.length > 0" class="suggestions-popup">
      <div class="no-suggestions">候補がありません</div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';

export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    authorOptions: {
      type: Array,
      default: () => []
    },
    seriesOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'select-suggestion'],
  setup(props, { emit }) {
    const showSuggestions = ref(false);
    const isFocused = ref(false);
    const inputEl = ref(null);

    // 著者とシリーズをまとめて表示
    const suggestions = computed(() => {
      const combined = [];
      props.authorOptions.forEach(author => {
        combined.push({ authors: [author], type: 'author' });
      });
      props.seriesOptions.forEach(series => {
        combined.push({ series: [series], type: 'series' });
      });
      return combined;
    });

    watch(() => props.authorOptions, () => {
      if (props.modelValue.length > 0 && isFocused.value && (props.authorOptions.length > 0 || props.seriesOptions.length > 0)) {
        showSuggestions.value = true;
      }
    });

    watch(() => props.seriesOptions, () => {
      if (props.modelValue.length > 0 && isFocused.value && (props.authorOptions.length > 0 || props.seriesOptions.length > 0)) {
        showSuggestions.value = true;
      }
    });

    const handleInput = (event) => {
      emit('update:modelValue', event.target.value);
      if (event.target.value.length > 0 && isFocused.value) {
        showSuggestions.value = true;
      } else {
        showSuggestions.value = false;
      }
    };

    const handleFocus = () => {
      isFocused.value = true;
      if (props.modelValue.length > 0 && (props.authorOptions.length > 0 || props.seriesOptions.length > 0)) {
        showSuggestions.value = true;
      }
    };

    const handleBlur = () => {
      isFocused.value = false;
      // リストをクリックする時間を確保するため、遅延をつける
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    const closeSuggestions = () => {
      isFocused.value = false;
      showSuggestions.value = false;
      inputEl.value?.blur();
    };

    const selectSuggestion = (suggestion) => {
      emit('select-suggestion', suggestion);
      closeSuggestions();
    };

    const applyAllSuggestions = () => {
      suggestions.value.forEach((suggestion) => {
        emit('select-suggestion', suggestion);
      });
      closeSuggestions();
    };

    return {
      showSuggestions,
      isFocused,
      suggestions,
      inputEl,
      handleInput,
      handleFocus,
      handleBlur,
      selectSuggestion,
      applyAllSuggestions,
      closeSuggestions,
    };
  },
};
</script>

<style scoped>
.title-suggestions-wrapper {
  position: relative;
  width: 100%;
}

.title-input {
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  padding: 0.75rem;
  width: 100%;
  font-size: 1rem;
}

.title-input:focus {
  outline: none;
  border-color: #999;
}

.suggestions-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  margin-top: 0;
  z-index: 50;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
  position: sticky;
  top: 0;
}

.suggestions-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.apply-all-button {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.apply-all-button:hover {
  background-color: #2563eb;
}

.apply-all-button:active {
  background-color: #1d4ed8;
}
.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
}

.suggestion-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  white-space: nowrap;
}

.suggestion-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.suggestion-button:active {
  background-color: #e5e7eb;
}

.suggestion-label {
  display: inline-block;
  padding: 2px 6px;
  background-color: #e5e7eb;
  border-radius: 4px;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.suggestion-text {
  color: #1f2937;
  font-weight: 500;
}

.no-suggestions {
  padding: 20px 16px;
  text-align: center;
  color: #999;
  font-size: 0.875rem;
}
</style>
