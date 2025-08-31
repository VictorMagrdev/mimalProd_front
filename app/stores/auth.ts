import { defineStore } from 'pinia'

interface User {
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}
interface LoginResponse {
  token: string
  user: {
    name: string
    email: string
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  }),

  actions: {
    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    },

    async login(email: string, password: string) {
      try {
        const response = await $fetch<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        this.setToken(response.token)
        this.setUser(response.user)
        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },

    async logout() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        await $fetch<LoginResponse>('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } finally {
        this.clearAuth()
        await navigateTo('/')
      }
    },

    async checkAuth() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return false

        const response = await $fetch<LoginResponse>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.setToken(token)
        this.setUser(response.user)
        return true
      } catch {
        this.clearAuth()
        return false
      } finally {
        this.loading = false
      }
    }
  }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
  }