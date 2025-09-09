<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface OrdenProduccionUI {
  id: string;
  numeroOrden: string;
  producto: { nombre: string };
  cantidad: number;
  unidad: { abreviatura: string };
  estado: { nombre: string };
  inicioPlanificado: string; // ISO date
  finPlanificado: string;    // ISO date
}

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetOrdenesProduccion);

const rows = computed<OrdenProduccionUI[]>(() => data.value?.ordenesProduccion || []);

const columns: TableColumn<OrdenProduccionUI>[] = [
  { accessorKey: "numeroOrden", header: "N° Orden", cell: ({ row }) => row.original.numeroOrden },
  { accessorKey: "producto.nombre", header: "Producto", cell: ({ row }) => row.original.producto.nombre },
  { accessorKey: "cantidad", header: "Cantidad", cell: ({ row }) => row.original.cantidad },
  { accessorKey: "unidad.abreviatura", header: "Unidad", cell: ({ row }) => row.original.unidad.abreviatura },
  { accessorKey: "estado.nombre", header: "Estado", cell: ({ row }) => row.original.estado.nombre },
  {
    accessorKey: "inicioPlanificado",
    header: "Inicio Plan.",
    cell: ({ row }) => new Date(row.original.inicioPlanificado).toLocaleDateString(),
  },
  {
    accessorKey: "finPlanificado",
    header: "Fin Plan.",
    cell: ({ row }) => new Date(row.original.finPlanificado).toLocaleDateString(),
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

function getRowItems(orden: OrdenProduccionUI) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        onSelect: () => openUpdateModal(orden.id),
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
    <h1>Órdenes de Producción</h1>
    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filtrar..." />

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
          <UButton label="Columnas" color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" />
        </UDropdownMenu>

        <UButton @click="isNewModalOpen = true">Nueva Orden</UButton>
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

    <OrdenesProduccionNewOrden
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="refetch"
    />
    <OrdenesProduccionUpdateOrden
      :is-open="!!selectedId"
      :orden-id="selectedId"
      @close="selectedId = null"
      @updated="refetch"
    />
  </div>
</template>
