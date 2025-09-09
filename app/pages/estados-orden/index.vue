<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetEstadosOrden from "~/graphql/estados-orden/get-estados-orden.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetEstadosOrden);
const rows = computed(() => data.value?.estadosOrden || []);

const columns: TableColumn[] = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
  { key: "activo", label: "Activo" },
  { key: "actions", label: "Acciones" },
];

const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Estados de Orden</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nuevo Estado</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <EstadosOrdenNewEstadoOrden
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <EstadosOrdenUpdateEstadoOrden
      :is-open="!!selectedId"
      :estado-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
