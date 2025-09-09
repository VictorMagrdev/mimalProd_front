<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetLineasOrden from "~/graphql/lineas-orden/get-lineas-orden.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetLineasOrden);
const rows = computed(() => data.value?.lineasOrden || []);

const columns: TableColumn[] = [
  { key: "orden.numeroOrden", label: "N° Orden" },
  { key: "numeroLinea", label: "N° Línea" },
  { key: "productoComponente.nombre", label: "Componente" },
  { key: "cantidadRequerida", label: "Cant. Requerida" },
  { key: "unidadComponente.abreviatura", label: "Unidad" },
  { key: "cantidadUsada", label: "Cant. Usada" },
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
    <h1>Líneas de Orden</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nueva Línea</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <LineasOrdenNewLinea
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <LineasOrdenUpdateLinea
      :is-open="!!selectedId"
      :linea-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
