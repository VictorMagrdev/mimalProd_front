import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();

  nuxtApp.hook("apollo:auth", ({ token }) => {
    if (authStore.token) {
      token.value = authStore.token;
    }
  });
});
