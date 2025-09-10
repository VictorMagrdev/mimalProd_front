// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  modules: [
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
        httpEndpoint: "http://localhost:8080/graphql",
        tokenStorage: "localStorage",
        authHeader: "Authorization",
        authType: "Bearer",
      },
    },
  },
  css: ["~/assets/css/main.css"],
});
