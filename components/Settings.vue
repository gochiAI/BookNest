<template>
  <div>
    <Button @click="openModal" type="icon" iconName="ic:baseline-settings" />
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 m-6 rounded-lg shadow-lg w-96">
        <h2 class="text-2xl font-bold mb-4">{{ t('Settings.title') }}</h2>
        <div class="mb-4">
          <Pulldown v-model="selectedLanguage" :id="'languagePulldown'" :label="'言語'" :options="languageOptions"
            @update:modelValue="updateLanguage" />
        </div>
        <div class="mb-4">
          <Pulldown v-model="selectedTheme" :id="'themePulldown'" :label="'テーマ'" :options="themeOptions" @update:modelValue="updateTheme" />
        </div>
        <div class="flex items-center">
          <div>最新ver</div>
          <a>1.2</a>
          
        </div>
        <div class="flex justify-end">
          <Button @click="closeModal">{{ t('Settings.close') }}</Button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from './Childs/Button.vue';
import Pulldown from './Form/Pulldown.vue';

const { t } = useI18n();

const isVisible = ref(false);
const selectedLanguage = ref('en');
const selectedStorageType = ref('prisma');
const selectedTheme = ref('light');

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }
];

const storageTypeOptions = [
  { value: 'prisma', label: 'Prisma' },
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'mongo', label: 'MongoDB' }
];

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const openModal = () => {
  isVisible.value = true;
};

const closeModal = () => {
  isVisible.value = false;
};

const updateLanguage = (value) => {
  selectedLanguage.value = value;
};

const updateStorageType = (value) => {
  selectedStorageType.value = value;
};

const updateTheme = (value) => {
  selectedTheme.value = value;
};
</script>

<style scoped>
.fixed {
  position: fixed;
}


.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-50 {
  z-index: 50;
}

.bg-black {
  background-color: rgba(0, 0, 0, 0.5);
}

.bg-gray-800 {
  background-color: #2d3748;
}

.text-white {
  color: #fff;
}

.p-2 {
  padding: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>