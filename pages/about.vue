<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">BookNest</h1>
      <p class="text-xl text-gray-600">Your Personal Book Management System</p>
      <p class="text-gray-500">v1.0.0</p>
    </div>

    <!-- Description -->
    <div class="bg-white rounded-lg border p-6 space-y-4">
      <h2 class="text-xl font-semibold">About BookNest</h2>
      <p class="text-gray-700">
        BookNest is a modern, intuitive application for managing your personal book collection.
        Whether you're an avid reader or just organizing your bookshelf, BookNest makes it easy
        to track, categorize, and discover your books.
      </p>
    </div>

    <!-- Features -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Features</h2>
      <ul class="space-y-3">
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Manage your book collection with detailed information</span>
        </li>
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Organize books into collections</span>
        </li>
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Tag and filter books by custom tags</span>
        </li>
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Track reading status (Read, Reading, Unread)</span>
        </li>
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Search and filter your library</span>
        </li>
        <li class="flex gap-3">
          <Icon name="check" size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
          <span class="text-gray-700">Backup and restore your data</span>
        </li>
      </ul>
    </div>

    <!-- Technology Stack -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Technology Stack</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium text-gray-900">Frontend</h3>
          <ul class="mt-2 space-y-1 text-sm text-gray-600">
            <li>Vue 3</li>
            <li>Nuxt 3</li>
            <li>Tailwind CSS</li>
            <li>Vue Router</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">Backend</h3>
          <ul class="mt-2 space-y-1 text-sm text-gray-600">
            <li>Nitro</li>
            <li>Prisma ORM</li>
            <li>SQLite/PostgreSQL</li>
            <li>TypeScript</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Links -->
    <div class="bg-white rounded-lg border p-6">
      <h2 class="text-xl font-semibold mb-4">Links</h2>
      <div class="space-y-2">
        <p class="text-gray-700">
          <a href="https://github.com" target="_blank" class="text-blue-600 hover:underline">
            GitHub Repository
          </a>
        </p>
        <p class="text-gray-700">
          <a href="https://booknest.example.com" target="_blank" class="text-blue-600 hover:underline">
            Official Website
          </a>
        </p>
      </div>
    </div>

    <!-- License & Author -->
    <div class="bg-white rounded-lg border p-6 text-center space-y-3">
      <p class="text-sm text-gray-600">
        © 2024 BookNest. All rights reserved.
      </p>
      <p class="text-sm text-gray-600">
        Created by <span class="font-medium">gochiAI</span>
      </p>
      <p class="text-xs text-gray-500">
        Licensed under the MIT License
      </p>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/icons.vue';
</script>

<style scoped>
/* スタイル */
</style>
