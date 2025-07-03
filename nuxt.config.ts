// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  css: [
    '@/assets/css/topToast.css',
    '~/assets/css/theme.css', // カスタムテーマスタイルを追加
  ],
  plugins:[
    {
      src: "plugins/toast.client.js",
      mode: "client",
    },
    {
      src: "plugins/sw.client.js",
      mode: "client",
    },
    {
      src:"plugins/indexedDB.ts",
      mode: "client"
    }

  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/device',
    '@nuxt/devtools',
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'english.json' },
      { code: 'ja', iso: 'ja-JP', file: 'japan.json' },
    ],
    langDir: '../i18n/',
    lazy: true,
    strategy: 'no_prefix',
    defaultLocale: 'en',
    // vueI18n: './i18n.config.ts',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
    },
  },
})