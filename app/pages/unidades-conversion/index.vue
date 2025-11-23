<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";
import NewConversion from "~/components/unidades-conversion/NewConversion.vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const GetUnidadesConversion = gql`
  query GetUnidadesConversion {
    unidadesConversion {
      id
      factor
      origen {
        id
        nombre
      }
      destino {
        id
        nombre
      }
    }
  }
`;

export interface UnidadConversion {
  id: string;
  factor: number;
  origen: { id: string; nombre: string };
  destino: { id: string; nombre: string };
}

interface UnidadesConversionResult {
  unidadesConversion: UnidadConversion[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<UnidadesConversionResult>(GetUnidadesConversion);

const conversiones = computed(() => data.value?.unidadesConversion || []);

const columns: TableColumn<UnidadConversion>[] = [
  {
    accessorKey: "origen.nombre",
    header: "Origen",
    cell: ({ row }: { row: Row<UnidadConversion> }) =>
      row.original.origen?.nombre || "-",
  },
  {
    accessorKey: "destino.nombre",
    header: "Destino",
    cell: ({ row }) => row.original.destino?.nombre || "-",
  },
  {
    accessorKey: "factor",
    header: "Factor",
    cell: ({ row }) => row.original.factor,
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

function getRowItems(conv: UnidadConversion) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(conv.id),
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
    <h1 class="text-2xl font-bold pl-8 pt-4">Conversión de Unidades</h1>

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

        <NewConversion @creado="refresh()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="conversiones || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="
            Math.max(
              1,
              Math.ceil((conversiones?.length || 0) / pagination.pageSize),
            )
          "
          :total="conversiones?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
