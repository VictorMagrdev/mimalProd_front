<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetInventariosLote from "~/graphql/inventario-lote/get-inventarios-lote.graphql";

// Interfaces de los subcampos
interface Lote {
  id: string;
}

interface Producto {
  id: string;
  nombre: string;
}

interface Bodega {
  id: string;
  nombre: string;
}

interface Unidad {
  id: string;
  nombre: string;
}

export interface InventarioLote {
  id: string;
  lote?: Lote;
  producto?: Producto;
  bodega?: Bodega;
  unidad?: Unidad;
  cantidad: number;
  actualizadoEn?: string;
}

interface InventarioLoteResult {
  inventarioLotes: InventarioLote[];
}

const { data, pending, error } =
  await useAsyncQuery<InventarioLoteResult>(GetInventariosLote);

const inventariosLote = computed(() => data.value?.inventarioLotes || []);

// columnas tipadas
const columns: TableColumn<InventarioLote>[] = [
  {
    accessorKey: "lote.id",
    header: "Lote",
    cell: ({ row }: { row: Row<InventarioLote> }) =>
      row.original.lote?.id || "-",
  },
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }) => row.original.producto?.nombre || "-",
  },
  {
    accessorKey: "bodega.nombre",
    header: "Bodega",
    cell: ({ row }) => row.original.bodega?.nombre || "-",
  },
  {
    accessorKey: "unidad.nombre",
    header: "Unidad",
    cell: ({ row }) => row.original.unidad?.nombre || "-",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => row.original.cantidad,
  },
  {
    accessorKey: "actualizadoEn",
    header: "Actualizado en",
    cell: ({ row }) => row.original.actualizadoEn || "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Inventario de lotes</h1>

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
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
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
        <InventarioLoteNewInventarioLote />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="inventariosLote || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="inventariosLote?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
