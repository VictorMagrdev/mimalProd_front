// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  ssr: false,
  debug: true,
  modules: [
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/image",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/apollo",
  ],
  apollo: {
    clients: {
      default: {
        httpEndpoint:
          "https://obvolutive-angelica-nonnotably.ngrok-free.dev/graphql",
        tokenStorage: "localStorage",
        authHeader: "Authorization",
        authType: "Bearer",
      },
    },
  },
  css: ["~/assets/css/main.css"],
});
