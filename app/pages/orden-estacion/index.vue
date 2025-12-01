<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import { computed, h, ref, resolveComponent } from "vue";

const GetOrdenesEstacion = gql`
  query GetOrdenesEstacion {
    ordenesEstacion {
      id
      ordenId
      estacionId
      inicioPlanificado
      finPlanificado
      inicioReal
      finReal
      estadoOrdenEstacionId
      observaciones
      estacion {
        id
        nombre
      }
      estado {
        id
        nombre
      }
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface OrdenEstacion {
  id: string;
  orden_id?: string | null;
  estacion_id?: string | null;
  inicio_planificado?: string | null;
  fin_planificado?: string | null;
  inicio_real?: string | null;
  fin_real?: string | null;
  estado_orden_estacion_id?: string | null;
  observaciones?: string | null;
  estacion?: { id: string; nombre?: string } | null;
  estado?: { id: string; nombre?: string } | null;
}

interface OrdenesEstacionResult {
  ordenesEstacion: OrdenEstacion[];
}

const { data, pending, error, execute } =
  await useAsyncQuery<OrdenesEstacionResult>(GetOrdenesEstacion);

const ordenesEstacion = computed(() => data.value?.ordenesEstacion || []);

const columns: TableColumn<OrdenEstacion>[] = [
  {
    accessorKey: "orden_id",
    header: "ID Orden",
    cell: ({ row }: { row: Row<OrdenEstacion> }) =>
      row.original.orden_id ?? "-",
  },
  {
    accessorKey: "estacion.nombre",
    header: "Estación",
    cell: ({ row }) => row.original.estacion?.nombre ?? "-",
  },
  {
    accessorKey: "inicio_real",
    header: "Inicio Real",
    cell: ({ row }) =>
      row.original.inicio_real
        ? new Date(row.original.inicio_real).toLocaleString()
        : "-",
  },
  {
    accessorKey: "fin_real",
    header: "Fin Real",
    cell: ({ row }) =>
      row.original.fin_real
        ? new Date(row.original.fin_real).toLocaleString()
        : "-",
  },
  {
    accessorKey: "estado.nombre",
    header: "Estado",
    cell: ({ row }) => row.original.estado?.nombre ?? "-",
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

function getRowItems(oe: OrdenEstacion) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(oe.id),
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
    <h1 class="text-2xl font-bold pl-8 pt-4">Orden Estación</h1>

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
        <OrdenEstacionNewOrdenEstacion @creado="execute()" />
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
        sticky
        class="flex-1 overflow-auto h-96"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="
            Math.max(
              1,
              Math.ceil((ordenesEstacion?.length || 0) / pagination.pageSize),
            )
          "
          :total="ordenesEstacion?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
