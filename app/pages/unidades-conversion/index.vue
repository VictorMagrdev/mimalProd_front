<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetUnidadesConversion from "~/graphql/unidades-conversion/get-unidades-conversion.graphql";

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetUnidadesConversion);
const rows = computed(() => data.value?.unidadesConversion || []);

const columns: TableColumn[] = [
  { key: "origen.nombre", label: "Origen" },
  { key: "destino.nombre", label: "Destino" },
  { key: "factor", label: "Factor" },
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
    <h1>Conversión de Unidades</h1>
    <div class="flex justify-between">
      <UInput placeholder="Filtrar..." />
      <UButton @click="isNewModalOpen = true">Nueva Conversión</UButton>
    </div>

    <UTable :columns="columns" :rows="rows" :loading="pending">
      <template #actions-data="{ row }">
        <UButton variant="ghost" @click="openUpdateModal(row.id)"
          >Actualizar</UButton
        >
      </template>
    </UTable>

    <div v-if="error">Error: {{ error.message }}</div>

    <UnidadesConversionNewConversion
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <UnidadesConversionUpdateConversion
      :is-open="!!selectedId"
      :conversion-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
