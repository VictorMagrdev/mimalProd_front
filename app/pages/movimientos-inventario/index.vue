<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetMovimientosInventario from "~/graphql/movimientos-inventario/get-movimientos-inventario.graphql";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface TipoMovimiento {
  id: string;
  nombre: string;
}
export interface Bodega {
  id: string;
  nombre: string;
}

export interface MovimientoInventario {
  id: string;
  fecha: string;
  bodegaOrigen: Bodega;
  bodegaDestino: Bodega;
  tipo: TipoMovimiento;
  referencia: string;
  observaciones: string;
  creadoPor: number;
  creadoEn: string;
}

interface MovimientoInventarioResult {
  movimientosInventario: MovimientoInventario[];
}

const { data, pending, error } =
  await useAsyncQuery<MovimientoInventarioResult>(GetMovimientosInventario);

const movimientosInventario = computed(
  () => data.value?.movimientosInventario || [],
);

const columns: TableColumn<MovimientoInventario>[] = [
  {
    accessorKey: "id",
    header: "id",
    cell: ({ row }: { row: Row<MovimientoInventario> }) => row.original.id,
  },
  {
    accessorKey: "fecha",
    header: "fecha",
    cell: ({ row }) => row.original.fecha,
  },
  {
    accessorKey: "bodegaOrigen",
    header: "bodegaOrigen",
    cell: ({ row }) => row.original.bodegaOrigen.nombre,
  },
  {
    accessorKey: "bodegaDestino",
    header: "bodegaDestino",
    cell: ({ row }: { row: Row<MovimientoInventario> }) =>
      row.original.bodegaDestino.nombre,
  },
  {
    accessorKey: "tipo",
    header: "tipo",
    cell: ({ row }) => row.original.tipo.nombre,
  },
  {
    accessorKey: "referencia",
    header: "referencia",
    cell: ({ row }) => row.original.referencia,
  },
  {
    accessorKey: "observaciones",
    header: "observaciones",
    cell: ({ row }) => row.original.observaciones,
  },
  {
    accessorKey: "creadoEn",
    header: "creadoEn",
    cell: ({ row }) => row.original.creadoEn,
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(UDropdownMenu, { items: getRowItems(row.original) }, () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          }),
        ),
      ),
  },
];

function getRowItems(tipo: MovimientoInventario) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(tipo.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();

const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Movimientos de inventario</h1>

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
              .filter((column) => column.getCanHide())
              .map((column) => ({
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
        :data="movimientosInventario || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="movimientosInventario?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
