<script setup lang="ts">
import { ref, computed, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetCostosOrden from "~/graphql/costos-orden/get-costos-orden.graphql";
import UpdateCosto from "~/components/costos-orden/UpdateCosto.vue";
import NewCosto from "~/components/costos-orden/NewCosto.vue";

interface Orden {
  id: string;
  numeroOrden: string;
}

interface TipoCosto {
  id: string;
  nombre: string;
}

export interface CostoOrden {
  id: string;
  orden: Orden;
  tipoCosto: TipoCosto;
  descripcion: string;
  monto: number;
  moneda: string;
  registradoEn: string;
}

const { data, pending, error } = await useAsyncQuery<{
  costosOrden: CostoOrden[];
}>(GetCostosOrden);

const rows = computed<CostoOrden[]>(() => data.value?.costosOrden ?? []);

// columnas tipadas
const columns: TableColumn<CostoOrden>[] = [
  {
    accessorKey: "orden.numeroOrden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<CostoOrden> }) => row.original.orden.numeroOrden,
  },
  {
    accessorKey: "tipoCosto.nombre",
    header: "Tipo de Costo",
    cell: ({ row }) => row.original.tipoCosto.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion,
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => row.original.monto.toString(),
  },
  {
    accessorKey: "moneda",
    header: "Moneda",
    cell: ({ row }) => row.original.moneda,
  },
  {
    accessorKey: "registradoEn",
    header: "Registrado",
    cell: ({ row }) => row.original.registradoEn,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          "button",
          {
            class: "text-primary hover:underline",
            onClick: () => openUpdateModal(row.original.id),
          },
          "Actualizar",
        ),
      ),
  },
];

const createModalOpen = ref(false);
const updateModalOpen = ref(false);

const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
  updateModalOpen.value = true;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Costos de Orden</h1>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput placeholder="Filtrar..." class="max-w-sm" />
      <UpdateCosto
        :open="updateModalOpen"
        :costo-id="selectedId"
        @close="updateModalOpen = false"
      />

      <UButton label="Nuevo costo de orden" @click="createModalOpen = true" />
      <NewCosto v-model:open="createModalOpen" />
    </div>

    <UTable :columns="columns" :data="rows" :loading="pending" class="mt-4" />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
