<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetLotesProduccion from '~/graphql/lotes-produccion/get-lotes-produccion.graphql';

const { data, pending, error, refresh: refetch } = await useAsyncQuery(GetLotesProduccion);
const rows = computed(() => data.value?.lotesProduccion || []);

const columns: TableColumn[] = [
  { key: "numeroLote", label: "Número de Lote" },
  { key: "producto.nombre", label: "Producto" },
  { key: "fabricadoEn", label: "Fabricado" },
  { key: "venceEn", label: "Vence" },
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
    <h1>Lotes de Producción</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nuevo Lote</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)">Actualizar</UButton>
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <LotesProduccionNewLote :is-open="isNewModalOpen" @close="isNewModalOpen = false" @created="refetch" />
    <LotesProduccionUpdateLote :is-open="!!selectedId" :lote-id="selectedId" @close="selectedId = null" @updated="refetch" />
  </div>
</template>
