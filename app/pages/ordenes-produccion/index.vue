<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetOrdenesProduccion);
const rows = computed(() => data.value?.ordenesProduccion || []);

const columns: TableColumn[] = [
  { key: "numeroOrden", label: "N° Orden" },
  { key: "producto.nombre", label: "Producto" },
  { key: "cantidad", label: "Cantidad" },
  { key: "unidad.abreviatura", label: "Unidad" },
  { key: "estado.nombre", label: "Estado" },
  { key: "inicioPlanificado", label: "Inicio Plan." },
  { key: "finPlanificado", label: "Fin Plan." },
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
    <h1>Órdenes de Producción</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nueva Orden</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <OrdenesProduccionNewOrden
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <OrdenesProduccionUpdateOrden
      :is-open="!!selectedId"
      :orden-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
