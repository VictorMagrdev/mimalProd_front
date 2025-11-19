<script setup lang="ts">
import { useRoute } from "vue-router";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const route = useRoute();
const userId = route.params.id as string;
const auth = useAuthStore();

const {
  data: user,
  pending,
  error,
} = useAsyncData("user", () =>
  $fetch<User>(`http://localhost:8080/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  }),
);
</script>

<template>
  <div class="p-4">
    <UCard v-if="user">
      <template #header>
        <h1 class="text-xl font-bold">Detalles del Usuario</h1>
      </template>

      <div class="space-y-4">
        <div>
          <h2 class="text-sm font-medium text-gray-500">ID</h2>
          <p class="text-lg">{{ user.id }}</p>
        </div>
        <div>
          <h2 class="text-sm font-medium text-gray-500">Username</h2>
          <p class="text-lg">{{ user.username }}</p>
        </div>
        <div>
          <h2 class="text-sm font-medium text-gray-500">Email</h2>
          <p class="text-lg">{{ user.email }}</p>
        </div>
        <div>
          <h2 class="text-sm font-medium text-gray-500">Roles</h2>
          <div
            v-if="user.roles && user.roles.length"
            class="flex flex-wrap gap-2 mt-1"
          >
            <UBadge
              v-for="role in user.roles"
              :key="role"
              color="primary"
              variant="subtle"
              >{{ role }}</UBadge
            >
          </div>
          <p v-else class="text-lg text-gray-500">-</p>
        </div>
      </div>

      <template #footer>
        <UButton @click="$router.back()">Volver</UButton>
      </template>
    </UCard>

    <div v-else-if="pending">
      <p>Cargando...</p>
    </div>

    <div v-else-if="error" class="text-red-500">
      <h2>Error al cargar el usuario</h2>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>
