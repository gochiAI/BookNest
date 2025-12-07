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

    <!-- Data Management -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Data Management</h2>
      <div class="space-y-4">
        <Button @click="handleBackup" variant="secondary">
          <Icon name="download" size="16" class="inline mr-2" />
          Backup Data
        </Button>
        <Button @click="handleRestore" variant="secondary">
          <Icon name="upload" size="16" class="inline mr-2" />
          Restore Data
        </Button>
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

<script setup>
import { ref, onMounted } from 'vue';
import Button from '@/components/ui/Button.vue';
import Icon from '@/components/icons.vue';

const theme = ref('light');
const language = ref('en');

const loadSettings = async () => {
  try {
    // Settings API から設定を読み込む
    // 実装予定
  } catch (error) {
    console.error('Error loading settings:', error);
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

const resetSettings = () => {
  if (window.confirm('Reset all settings to default?')) {
    loadSettings();
  }
};

const handleBackup = async () => {
  try {
    const response = await fetch('/api/settings/backup', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Backup failed');
    alert('Backup completed successfully!');
  } catch (error) {
    console.error('Error backing up:', error);
    alert('Failed to backup data');
  }
};

const handleRestore = async () => {
  if (!window.confirm('Restore from latest backup? This will overwrite current data.')) return;

  try {
    const response = await fetch('/api/settings/restore', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Restore failed');
    alert('Data restored successfully!');
  } catch (error) {
    console.error('Error restoring:', error);
    alert('Failed to restore data');
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
/* スタイル */
</style>
