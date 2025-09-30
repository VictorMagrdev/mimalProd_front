<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetOrdenesEstacion from "~/graphql/orden-estacion/get-ordenes-estacion.graphql";

// Interfaces
interface Orden {
  id: string;
  numeroOrden: string;
}

interface Estacion {
  id: string;
  nombre: string;
}

// Interfaz actualizada según esquema GraphQL
export interface OrdenEstacion {
  id: string;
  orden: Orden;
  estacion: Estacion;
  inicioReal?: string;
  finReal?: string;
}

interface OrdenesEstacionResult {
  ordenesEstacion: OrdenEstacion[];
}

const { data, pending, error } =
  await useAsyncQuery<OrdenesEstacionResult>(GetOrdenesEstacion);

const ordenesEstacion = computed(() => data.value?.ordenesEstacion || []);

// columnas tipadas
const columns: TableColumn<OrdenEstacion>[] = [
  {
    accessorKey: "orden.numeroOrden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<OrdenEstacion> }) =>
      row.original.orden.numeroOrden,
  },
  {
    accessorKey: "estacion.nombre",
    header: "Estación",
    cell: ({ row }) => row.original.estacion.nombre,
  },
  {
    accessorKey: "inicioReal",
    header: "Fecha de Inicio",
    cell: ({ row }) => row.original.inicioReal || "-",
  },
  {
    accessorKey: "finReal",
    header: "Fecha de Fin",
    cell: ({ row }) => row.original.finReal || "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Orden estacion</h1>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />

      <div class="flex items-center space-x-2">
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column:any) => column.getCanHide())
              .map((column:any) => ({
                label: column.id,
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi
                    ?.getColumn(column.id)
                    ?.toggleVisibility(checked);
                },
                onSelect(e?: Event) {
                  e?.preventDefault();
                },
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columnas"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="ordenesEstacion || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="ordenesEstacion?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
