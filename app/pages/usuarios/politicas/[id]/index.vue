<script setup lang="ts">
import { useRoute } from "vue-router";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  description?: string;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface Policy {
  id: number;
  role: Role;
  tag: Tag;
  permission: Permission;
}

const route = useRoute();
const policyId = route.params.id;

const auth = useAuthStore();

const {
  data: policy,
  pending,
  error,
} = useAsyncData<Policy>(`policy-${policyId}`, () =>
  $fetch(`http://localhost:8080/api/policies/${policyId}`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  }),
);
</script>

<template>
  <div class="p-4">
    <UCard v-if="policy">
      <template #header>
        <h1 class="text-xl font-bold">Detalles de la Política</h1>
      </template>

      <div class="space-y-6">
        <div>
          <h2 class="text-sm font-medium text-gray-500">ID de la Política</h2>
          <p class="text-lg">{{ policy.id }}</p>
        </div>

        <div class="p-4 border rounded-md">
          <h3 class="text-md font-semibold mb-2">Rol Asignado</h3>
          <p><span class="font-medium">Nombre:</span> {{ policy.role.name }}</p>
          <p>
            <span class="font-medium">Descripción:</span>
            {{ policy.role.description || "-" }}
          </p>
        </div>

        <div class="p-4 border rounded-md">
          <h3 class="text-md font-semibold mb-2">Tag Aplicado</h3>
          <p><span class="font-medium">Nombre:</span> {{ policy.tag.name }}</p>
          <p>
            <span class="font-medium">Descripción:</span>
            {{ policy.tag.description || "-" }}
          </p>
        </div>

        <div class="p-4 border rounded-md">
          <h3 class="text-md font-semibold mb-2">Permiso Concedido</h3>
          <p>
            <span class="font-medium">Acción:</span>
            {{ policy.permission.name }}
          </p>
          <p>
            <span class="font-medium">Descripción:</span>
            {{ policy.permission.description || "-" }}
          </p>
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
      <h2>Error al cargar la política</h2>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>
