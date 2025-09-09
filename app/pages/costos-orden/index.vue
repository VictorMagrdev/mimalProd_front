<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetCostosOrden from '~/graphql/costos-orden/get-costos-orden.graphql';

const { data, pending, error, refresh: refetch } = await useAsyncQuery(GetCostosOrden);
const rows = computed(() => data.value?.costosOrden || []);

const columns: TableColumn[] = [
  { key: "orden.numeroOrden", label: "N° Orden" },
  { key: "tipoCosto.nombre", label: "Tipo de Costo" },
  { key: "descripcion", label: "Descripción" },
  { key: "monto", label: "Monto" },
  { key: "moneda", label: "Moneda" },
  { key: "registradoEn", label: "Registrado" },
  { key: 'actions', label: 'Acciones' }
];

const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}

</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Costos de Orden</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nuevo Costo</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)">Actualizar</UButton>
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <CostosOrdenNewCosto :is-open="isNewModalOpen" @close="isNewModalOpen = false" @created="refetch" />
    <CostosOrdenUpdateCosto :is-open="!!selectedId" :costo-id="selectedId" @close="selectedId = null" @updated="refetch" />
  </div>
</template>
