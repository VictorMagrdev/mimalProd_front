export default defineNuxtRouteMiddleware(() => {
  const loggedIn  = useAuthStore()

  if (!loggedIn.isAuthenticated) {
    return navigateTo('/login')
  }
})
