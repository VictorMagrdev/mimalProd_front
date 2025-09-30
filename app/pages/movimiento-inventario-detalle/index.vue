<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetMovimientosInventarioDetalle from "~/graphql/movimiento-inventario-detalle/get-movimientos-inventario-detalle.graphql";

interface MovimientoInventario {
  id: string;
}

interface Producto {
  id: string;
  nombre: string;
}

export interface MovimientoInventarioDetalle {
  id: string;
  movimiento: MovimientoInventario;
  producto: Producto;
  cantidad: number;
  costoUnitario: number;
}
interface MovimientoInventarioDetalleResult {
  movimientosInventarioDetalle: MovimientoInventarioDetalle[];
}
const { data, pending, error } =
  await useAsyncQuery<MovimientoInventarioDetalleResult>(
    GetMovimientosInventarioDetalle,
  );
const movimientosInventarioDetalle = computed(
  () => data.value?.movimientosInventarioDetalle || [],
);

const columns: TableColumn<MovimientoInventarioDetalle>[] = [
  {
    accessorKey: "movimiento.id",
    header: "N° Movimiento",
    cell: ({ row }: { row: Row<MovimientoInventarioDetalle> }) =>
      row.original.movimiento.id,
  },
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }) => row.original.producto.nombre,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => row.original.cantidad,
  },
  {
    accessorKey: "costoUnitario",
    header: "Costo Unitario",
    cell: ({ row }) => row.original.costoUnitario.toString(),
  },
];
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Tipos de Costo</h1>

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
        :data="movimientosInventarioDetalle || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="movimientosInventarioDetalle?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
