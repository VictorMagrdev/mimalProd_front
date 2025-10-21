<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import { gql } from "graphql-tag";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const GetTiposMovimiento = gql`
  query GetTiposMovimiento {
    tiposMovimiento {
      id
      codigo
      nombre
      descripcion
      afectaWip
      creadoEn
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface TipoMovimiento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  afecta_wip: boolean;
  creadoEn: string;
}

interface TipoMovimientoResult {
  tiposMovimiento: TipoMovimiento[];
}

const { data, pending, error } =
  await useAsyncQuery<TipoMovimientoResult>(GetTiposMovimiento);

const tiposMovimiento = computed(() => data.value?.tiposMovimiento || []);

const columns: TableColumn<TipoMovimiento>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<TipoMovimiento> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion,
  },
  {
    accessorKey: "afecta_wip",
    header: "Afecta WIP",
    cell: ({ row }: { row: Row<TipoMovimiento> }) =>
      row.original.afecta_wip ? "Sí" : "No",
  },
  {
    accessorKey: "creadoEn",
    header: "Creado en",
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

function getRowItems(tipo: TipoMovimiento) {
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
    <h1 class="text-2xl font-bold">Tipos de Movimiento</h1>

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

        <UButton
          label="Nuevo Tipo de Movimiento"
          @click="isNewModalOpen = true"
        />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="tiposMovimiento || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="tiposMovimiento?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
