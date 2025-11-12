export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  if (auth.isAuthenticated || to.path === "/login") return;

  if (import.meta.client && window.location.pathname !== "/login") {
    return navigateTo("/login");
  }
});
