<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";

const GetOrdenesProduccion = gql`
  query GetOrdenesProduccion {
    ordenesProduccion {
      id
      numeroOrden
      cantidad
      unidad {
        id
        abreviatura
      }
      estado {
        id
        nombre
      }
      inicioPlanificado
      finPlanificado
      inicioReal
      finReal
      cantidadDesperdicio
      cantidadProducida
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface OrdenProduccion {
  id: string;
  numeroOrden: string;
  cantidad?: number | null;
  unidad?: { id: string; abreviatura?: string } | null;
  estado?: { id: string; nombre?: string } | null;
  inicioPlanificado?: string | null;
  finPlanificado?: string | null;
  inicioReal?: string | null;
  finReal?: string | null;
  cantidadDesperdicio?: number | null;
  cantidadProducida?: number | null;
}

interface OrdenesProduccionResult {
  ordenesProduccion: OrdenProduccion[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<OrdenesProduccionResult>(GetOrdenesProduccion);

const rows = computed<OrdenProduccion[]>(
  () => data.value?.ordenesProduccion || [],
);

const columns: TableColumn<OrdenProduccion>[] = [
  {
    accessorKey: "numero_orden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<OrdenProduccion> }) => row.original.numeroOrden,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => row.original.cantidad ?? "-",
  },
  {
    accessorKey: "unidad.abreviatura",
    header: "Unidad",
    cell: ({ row }) => row.original.unidad?.abreviatura ?? "-",
  },
  {
    accessorKey: "estado.nombre",
    header: "Estado",
    cell: ({ row }) => row.original.estado?.nombre ?? "-",
  },
  {
    accessorKey: "inicio_planificado",
    header: "Inicio Plan.",
    cell: ({ row }) =>
      row.original.inicioPlanificado
        ? new Date(row.original.inicioPlanificado).toLocaleDateString()
        : "-",
  },
  {
    accessorKey: "fin_planificado",
    header: "Fin Plan.",
    cell: ({ row }) =>
      row.original.finPlanificado
        ? new Date(row.original.finPlanificado).toLocaleDateString()
        : "-",
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

function getRowItems(orden: OrdenProduccion) {
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

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold pl-8 pt-4">Órdenes de Producción</h1>

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
        <OrdenesProduccionNewOrdenProduccion @creado="refresh()" />
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
          :total="rows?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
