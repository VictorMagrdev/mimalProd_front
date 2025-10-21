<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";

const GetMovimientosInventario = gql`
  query GetMovimientosInventario {
    movimientosInventario {
      id
      fecha
      bodegaOrigen {
        id
        nombre
      }
      bodegaDestino {
        id
        nombre
      }
      tipoMovimiento {
        id
        nombre
      }
      referencia
      observaciones
      creadoPor
      creadoEn
      detalles {
        id
        productoId
        cantidad
        unidadId
      }
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface MovimientoInventarioDetalle {
  id: string;
  producto_id?: string | null;
  cantidad?: number | null;
  unidad_id?: string | null;
}

export interface MovimientoInventario {
  id: string;
  fecha?: string | null;
  bodega_origen?: { id: string; nombre?: string } | null;
  bodega_destino?: { id: string; nombre?: string } | null;
  tipo_movimiento?: { id: string; nombre?: string } | null;
  referencia?: string | null;
  observaciones?: string | null;
  creado_por?: string | null;
  creadoEn?: string | null;
  detalles?: MovimientoInventarioDetalle[] | null;
}

interface MovimientoInventarioResult {
  movimientosInventario: MovimientoInventario[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<MovimientoInventarioResult>(GetMovimientosInventario);

const movimientosInventario = computed(
  () => data.value?.movimientosInventario || [],
);

const columns: TableColumn<MovimientoInventario>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }: { row: Row<MovimientoInventario> }) => row.original.id,
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) =>
      row.original.fecha ? new Date(row.original.fecha).toLocaleString() : "-",
  },
  {
    accessorKey: "bodega_origen.nombre",
    header: "Bodega Origen",
    cell: ({ row }) => row.original.bodega_origen?.nombre ?? "-",
  },
  {
    accessorKey: "bodega_destino.nombre",
    header: "Bodega Destino",
    cell: ({ row }) => row.original.bodega_destino?.nombre ?? "-",
  },
  {
    accessorKey: "tipo_movimiento.nombre",
    header: "Tipo Movimiento",
    cell: ({ row }) => row.original.tipo_movimiento?.nombre ?? "-",
  },
  {
    accessorKey: "referencia",
    header: "Referencia",
    cell: ({ row }) => row.original.referencia ?? "-",
  },
  {
    accessorKey: "observaciones",
    header: "Observaciones",
    cell: ({ row }) => row.original.observaciones ?? "-",
  },
  {
    accessorKey: "creadoEn",
    header: "Creado En",
    cell: ({ row }) =>
      row.original.creadoEn
        ? new Date(row.original.creadoEn).toLocaleString()
        : "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          { items: getRowItems(row.original), content: { align: "end" } },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
            }),
        ),
      ),
  },
];

function getRowItems(m: MovimientoInventario) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(m.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Movimientos de Inventario</h1>

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
        <NewMovimientoInventario @creado="refresh()" />
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
          :page-count="
            Math.max(
              1,
              Math.ceil(
                (movimientosInventario?.length || 0) / pagination.pageSize,
              ),
            )
          "
          :total="movimientosInventario?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
