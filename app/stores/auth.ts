import { defineStore } from "pinia";
import { useStorage, useAsyncState } from "@vueuse/core";

interface Policy {
  tag: string;
  permission: string;
}

interface User {
  username: string;
  roles: string[];
  policies: Policy[];
}

interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
  policies: Policy[];
}

export const useAuthStore = defineStore("auth", () => {
  const token = useStorage<string | null>("token", null);
  const user = useStorage<User | null>("user", null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const loading = ref(false);

  const setUser = (u: User) => (user.value = u);
  const clearAuth = () => {
    token.value = null;
    user.value = null;
  };

  const { execute: login } = useAsyncState(
    async (username: string, password: string) => {
      const response = await $fetch<LoginResponse>(
        "https://engagement-roommate-martha-brunette.trycloudflare.com/api/auth/login",
        {
          method: "POST",
          body: { username, password },
        },
      );
      token.value = response.token;
      setUser({
        username: response.username,
        roles: response.roles,
        policies: response.policies,
      });
      return true;
    },
    false,
    { immediate: false },
  );

  const logout = async () => {
    clearAuth();
    await navigateTo("/");
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    clearAuth,
  };
});
