<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import { computed, ref, resolveComponent } from "vue";

const GetOrdenesEvento = gql`
  query GetOrdenesEvento {
    ordenesEvento {
      id
      ordenId
      evento
      descripcion
      fecha
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface OrdenEvento {
  id: string;
  orden_id?: string | null;
  evento: string;
  descripcion?: string | null;
  fecha?: string | null;
}

interface OrdenEventoResult {
  ordenesEvento: OrdenEvento[];
}

const { data, pending, error, execute } =
  await useAsyncQuery<OrdenEventoResult>(GetOrdenesEvento);

const ordenesEvento = computed(() => data.value?.ordenesEvento || []);

const columns: TableColumn<OrdenEvento>[] = [
  {
    accessorKey: "orden_id",
    header: "ID Orden",
    cell: ({ row }: { row: Row<OrdenEvento> }) => row.original.orden_id ?? "-",
  },
  {
    accessorKey: "evento",
    header: "Evento",
    cell: ({ row }) => row.original.evento,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion ?? "-",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => row.original.fecha ?? "-",
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

function getRowItems(ev: OrdenEvento) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(ev.id),
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
    <h1 class="text-2xl font-bold pl-8 pt-4">Ordenes Evento</h1>

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
        <OrdenEventoNewOrdenEvento @creado="execute()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="ordenesEvento || []"
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
              Math.ceil((ordenesEvento?.length || 0) / pagination.pageSize),
            )
          "
          :total="ordenesEvento?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
