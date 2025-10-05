<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const GetLineasOrden = gql`
  query GetLineasOrden {
    lineasOrden {
      id
      orden_id
      numero_linea
      producto_componente {
        id
        nombre
      }
      cantidad_requerida
      unidad_componente {
        id
        abreviatura
      }
      cantidad_usada
      costo_unitario
      costo_total
      observaciones
      creado_en
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface LineaOrdenRaw {
  id: string;
  orden_id?: string | null;
  numero_linea?: number | null;
  producto_componente?: { id: string; nombre?: string } | null;
  cantidad_requerida?: number | null;
  unidad_componente?: { id: string; abreviatura?: string } | null;
  cantidad_usada?: number | null;
  costo_unitario?: number | null;
  costo_total?: number | null;
  observaciones?: string | null;
  creado_en?: string | null;
}

export interface LineaOrdenUI {
  id: string;
  ordenId?: string | null;
  numeroLinea?: number | null;
  productoComponente?: { id: string; nombre?: string } | null;
  cantidadRequerida?: number | null;
  unidadComponente?: { id: string; abreviatura?: string } | null;
  cantidadUsada?: number | null;
  costoUnitario?: number | null;
  costoTotal?: number | null;
  observaciones?: string | null;
  creadoEn?: string | null;
}

interface LineasOrdenResult {
  lineasOrden: LineaOrdenRaw[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<LineasOrdenResult>(GetLineasOrden);

const rows = computed<LineaOrdenUI[]>(() =>
  (data.value?.lineasOrden || []).map((l) => ({
    id: l.id,
    ordenId: l.orden_id ?? null,
    numeroLinea: l.numero_linea ?? null,
    productoComponente: l.producto_componente ?? null,
    cantidadRequerida: l.cantidad_requerida ?? null,
    unidadComponente: l.unidad_componente ?? null,
    cantidadUsada: l.cantidad_usada ?? null,
    costoUnitario: l.costo_unitario ?? null,
    costoTotal: l.costo_total ?? null,
    observaciones: l.observaciones ?? null,
    creadoEn: l.creado_en ?? null,
  })),
);

const columns: TableColumn<LineaOrdenUI>[] = [
  {
    accessorKey: "ordenId",
    header: "Orden ID",
    cell: ({ row }: { row: Row<LineaOrdenUI> }) => row.original.ordenId ?? "-",
  },
  {
    accessorKey: "numeroLinea",
    header: "N° Línea",
    cell: ({ row }) => row.original.numeroLinea ?? "-",
  },
  {
    accessorKey: "productoComponente.nombre",
    header: "Componente",
    cell: ({ row }) => row.original.productoComponente?.nombre ?? "-",
  },
  {
    accessorKey: "cantidadRequerida",
    header: "Cant. Requerida",
    cell: ({ row }) => row.original.cantidadRequerida ?? "-",
  },
  {
    accessorKey: "unidadComponente.abreviatura",
    header: "Unidad",
    cell: ({ row }) => row.original.unidadComponente?.abreviatura ?? "-",
  },
  {
    accessorKey: "cantidadUsada",
    header: "Cant. Usada",
    cell: ({ row }) => row.original.cantidadUsada ?? "-",
  },
  {
    accessorKey: "costoUnitario",
    header: "Costo Unitario",
    cell: ({ row }) => row.original.costoUnitario ?? "-",
  },
  {
    accessorKey: "costoTotal",
    header: "Costo Total",
    cell: ({ row }) => row.original.costoTotal ?? "-",
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

function getRowItems(linea: LineaOrdenUI) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        onSelect: () => openUpdateModal(linea.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref("");
const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Líneas de Orden</h1>

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

        <NewLinea @creado="refresh()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="rows"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="
            Math.max(1, Math.ceil((rows?.length || 0) / pagination.pageSize))
          "
          :total="rows?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
