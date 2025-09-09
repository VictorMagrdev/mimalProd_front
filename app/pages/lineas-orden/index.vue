<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetLineasOrden from "~/graphql/lineas-orden/get-lineas-orden.graphql";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface LineaOrdenUI {
  id: string;
  orden: { numeroOrden: string };
  numeroLinea: number;
  productoComponente: { nombre: string };
  cantidadRequerida: number;
  unidadComponente: { abreviatura: string };
  cantidadUsada: number;
}

interface LineasOrdenResult {
  lineasOrden: LineaOrdenUI[];
}

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery<LineasOrdenResult>(GetLineasOrden);

const rows = computed<LineaOrdenUI[]>(() => data.value?.lineasOrden || []);

const columns: TableColumn<LineaOrdenUI>[] = [
  {
    accessorKey: "orden.numeroOrden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<LineaOrdenUI> }) =>
      row.original.orden.numeroOrden,
  },
  {
    accessorKey: "numeroLinea",
    header: "N° Línea",
    cell: ({ row }) => row.original.numeroLinea,
  },
  {
    accessorKey: "productoComponente.nombre",
    header: "Componente",
    cell: ({ row }) => row.original.productoComponente.nombre,
  },
  {
    accessorKey: "cantidadRequerida",
    header: "Cant. Requerida",
    cell: ({ row }) => row.original.cantidadRequerida,
  },
  {
    accessorKey: "unidadComponente.abreviatura",
    header: "Unidad",
    cell: ({ row }) => row.original.unidadComponente.abreviatura,
  },
  {
    accessorKey: "cantidadUsada",
    header: "Cant. Usada",
    cell: ({ row }) => row.original.cantidadUsada,
  },
  {
    id: "actions",
    header: "Acciones",
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
const globalFilter = ref();

const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Líneas de Orden</h1>
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
                    ?.toggleVisibility(!!checked);
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

        <UButton @click="isNewModalOpen = true">Nueva Línea</UButton>
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
          :page-count="pagination.pageSize"
          :total="rows.length"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>

    <LineasOrdenNewLinea
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <LineasOrdenUpdateLinea
      :is-open="!!selectedId"
      :linea-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
