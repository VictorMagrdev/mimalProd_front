export default defineNuxtRouteMiddleware((to) => {
  const loggedIn = useAuthStore()

  if (!loggedIn.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }
})
