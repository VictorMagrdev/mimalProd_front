<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetUnidadesMedidaTipo from "~/graphql/unidades-medida-tipo/get-unidades-medida-tipo.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetUnidadesMedidaTipo);
const rows = computed(() => data.value?.unidadesMedidaTipo || []);

const columns: TableColumn[] = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
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
    <h1>Tipos de Unidad de Medida</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nuevo Tipo</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <UnidadesMedidaTipoNewTipo
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <UnidadesMedidaTipoUpdateTipo
      :is-open="!!selectedId"
      :tipo-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
