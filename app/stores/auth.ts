import { defineStore } from "pinia";
interface Policy {
  tag: string;
  permission: string;
}

interface User {
  username: string;
  roles: string[];
  policies: Policy[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
  policies: Policy[];
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  }),
  persist: {
    storage: localStorage,
  },
  actions: {
    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = true;
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem("token", token);
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem("token");
    },

    async login(username: string, password: string) {
      try {
        const response = await $fetch<LoginResponse>(
          "http://localhost:8080/api/auth/login",
          {
            method: "POST",
            body: { username, password },
          },
        );

        this.setToken(response.token);
        this.setUser({
          username: response.username,
          roles: response.roles,
          policies: response.policies,
        });
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },

    async logout() {
      this.clearAuth();
      await navigateTo("/");
    },
  },
});
