<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetPuntosReorden from "~/graphql/punto-reorden/get-puntos-reorden.graphql";

interface Producto {
  id: string;
  nombre: string;
}

interface Unidad {
  id: string;
  nombre: string;
}

export interface PuntoReorden {
  id: string;
  producto: Producto;
  stockMinimo: number;
  stockSeguridad?: number;
  unidad?: Unidad;
}

interface PuntoReordenResult {
  puntosReorden: PuntoReorden[];
}

const { data, pending, error } =
  await useAsyncQuery<PuntoReordenResult>(GetPuntosReorden);

const puntosReorden = computed(() => data.value?.puntosReorden || []);

// columnas tipadas
const columns: TableColumn<PuntoReorden>[] = [
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }: { row: Row<PuntoReorden> }) => row.original.producto.nombre,
  },
  {
    accessorKey: "stockMinimo",
    header: "Stock Mínimo",
    cell: ({ row }) => row.original.stockMinimo,
  },
  {
    accessorKey: "stockSeguridad",
    header: "Stock de Seguridad",
    cell: ({ row }) => row.original.stockSeguridad ?? "-",
  },
  {
    accessorKey: "unidad.nombre",
    header: "Unidad",
    cell: ({ row }) => row.original.unidad?.nombre ?? "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Puntos de reorden</h1>

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
        :data="puntosReorden || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="puntosReorden?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
