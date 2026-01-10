<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">Settings</h1>
      <p class="text-gray-600">Manage your application preferences</p>
    </div>

    <!-- Theme Settings -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Theme</h2>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Color Theme</label>
          <div class="mt-2 flex gap-4">
            <button
              @click="theme = 'light'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition',
                theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              <Icon name="light" size="16" class="inline mr-2" />
              Light
            </button>
            <button
              @click="theme = 'dark'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition',
                theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              <Icon name="dark" size="16" class="inline mr-2" />
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Settings -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Language</h2>
      <div>
        <select
          v-model="language"
          class="px-4 py-2 border rounded-md text-sm"
        >
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </div>

    <!-- Export Section -->
    <ExportSection />

    <!-- Backup & Restore Section -->
    <BackupRestoreSection />

    <!-- Customization -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Customization</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Reviews -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Reviews</h3>
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="reviewsEnabled" />
              Enable Reviews
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="enableCompletedDate" />
              Enable Completed Date
            </label>
            <div>
              <label class="block text-sm font-medium mb-1">Max Review Length</label>
              <input type="number" min="1" class="border rounded px-3 py-2 w-full text-sm" v-model.number="maxReviewLength" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Required when status = Completed</label>
              <div class="flex flex-wrap gap-3 text-sm">
                <label class="flex items-center gap-2"><input type="checkbox" value="rating" v-model="requireOnCompleted" /> rating</label>
                <label class="flex items-center gap-2"><input type="checkbox" value="completedDate" v-model="requireOnCompleted" /> completedDate</label>
                <label class="flex items-center gap-2"><input type="checkbox" value="reviewComment" v-model="requireOnCompleted" /> reviewComment</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Requirements -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Registration Required Fields</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" value="title" v-model="requiredOnCreate" /> title</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="authorNames" v-model="requiredOnCreate" /> authorNames</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="bookType" v-model="requiredOnCreate" /> bookType</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="readStatus" v-model="requiredOnCreate" /> readStatus</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="publisherName" v-model="requiredOnCreate" /> publisherName</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="seriesName" v-model="requiredOnCreate" /> seriesName</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="isbn" v-model="requiredOnCreate" /> isbn</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="releaseDate" v-model="requiredOnCreate" /> releaseDate</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="volume" v-model="requiredOnCreate" /> volume</label>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <Button @click="saveCustomization" variant="secondary">Save Customization</Button>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex gap-2">
      <Button @click="saveSettings" variant="secondary">
        Save Settings
      </Button>
      <Button @click="resetSettings" variant="outline">
        Reset
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '@/components/button.vue';
import Icon from '@/components/icons.vue';

const theme = ref('light');
const language = ref('en');
// Customization state
const reviewsEnabled = ref(true);
const maxReviewLength = ref(500);
const enableCompletedDate = ref(true);
const requireOnCompleted = ref<string[]>(['rating','completedDate']);
const requiredOnCreate = ref<string[]>(['title','authorNames','bookType','readStatus']);

const loadSettings = async () => {
  try {
    // Settings API から設定を読み込む
    // 実装予定
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

const loadCustomization = async () => {
  try {
    const res = await fetch('/api/settings/customization');
    const json = await res.json();
    const cfg = json.data || {};
    const reviews = cfg.reviews || {};
    reviewsEnabled.value = reviews.enabled ?? true;
    maxReviewLength.value = reviews.maxReviewLength ?? 500;
    enableCompletedDate.value = reviews.enableCompletedDate ?? true;
    requireOnCompleted.value = (reviews.requireOnStatus?.Completed ?? ['rating','completedDate']).slice();

    const reg = cfg.registration || {};
    requiredOnCreate.value = (reg.requiredOnCreate ?? ['title','authorNames','bookType','readStatus']).slice();
  } catch (error) {
    console.error('Error loading customization:', error);
  }
};

const saveSettings = async () => {
  try {
    // Settings を保存
    alert('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  }
};

const saveCustomization = async () => {
  try {
    const payload = {
      reviews: {
        enabled: reviewsEnabled.value,
        maxReviewLength: maxReviewLength.value,
        enableCompletedDate: enableCompletedDate.value,
        requireOnStatus: { Completed: requireOnCompleted.value }
      },
      registration: {
        requiredOnCreate: requiredOnCreate.value
      }
    };
    const res = await fetch('/api/settings/customization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save customization');
    alert('Customization saved');
  } catch (error) {
    console.error('Error saving customization:', error);
    alert('Failed to save customization');
  }
};

const resetSettings = () => {
  if (window.confirm('Reset all settings to default?')) {
    loadSettings();
  }
};

onMounted(() => {
  loadSettings();
  loadCustomization();
});
</script>

<style scoped>
/* スタイル */
</style>
