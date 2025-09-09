<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetUnidadesMedida);
const rows = computed(() => data.value?.unidadesMedida || []);

const columns: TableColumn[] = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "abreviatura", label: "Abreviatura" },
  { key: "tipo.nombre", label: "Tipo" },
  { key: "esActiva", label: "Activa" },
  { key: "esBase", label: "Es Base" },
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
    <h1>Unidades de Medida</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nueva Unidad</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <UnidadesMedidaNewUnidad
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <UnidadesMedidaUpdateUnidad
      :is-open="!!selectedId"
      :unidad-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
