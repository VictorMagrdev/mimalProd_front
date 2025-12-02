export default defineNuxtPlugin((nuxtApp) => {
  const BASE_URL = "https://api.minimalprod.space";

  const auth = useAuthStore();

  const publicApi = $fetch.create({
    baseURL: BASE_URL,
  });

  const authApi = $fetch.create({
    baseURL: BASE_URL,
    onRequest({ options }) {
      if (auth.token) {
        options.headers.set("Authorization", `Bearer ${auth.token}`);
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/login"));
      }
    },
  });

  return {
    provide: {
      publicApi,
      authApi,
    },
  };
});
