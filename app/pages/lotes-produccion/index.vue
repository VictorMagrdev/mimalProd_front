<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetLotesProduccion from "~/graphql/lotes-produccion/get-lotes-produccion.graphql";
import NewLote from "~/components/lotes-produccion/NewLote.vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

// Tipo de cada lote (ya lo definiste)
export interface LoteProduccionUI {
  id: string;
  numeroLote: string;
  producto: { nombre: string };
  fabricadoEn: string;
  venceEn: string;
}

interface LotesProduccionResult {
  lotesProduccion: LoteProduccionUI[];
}

const { data, pending, error } =
  await useAsyncQuery<LotesProduccionResult>(GetLotesProduccion);

const rows = computed<LoteProduccionUI[]>(
  () => data.value?.lotesProduccion || [],
);

const columns: TableColumn<LoteProduccionUI>[] = [
  {
    accessorKey: "numeroLote",
    header: "Número de Lote",
    cell: ({ row }: { row: Row<LoteProduccionUI> }) => row.original.numeroLote,
  },
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }) => row.original.producto.nombre,
  },
  {
    accessorKey: "fabricadoEn",
    header: "Fabricado",
    cell: ({ row }) => new Date(row.original.fabricadoEn).toLocaleDateString(),
  },
  {
    accessorKey: "venceEn",
    header: "Vence",
    cell: ({ row }) => new Date(row.original.venceEn).toLocaleDateString(),
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

function getRowItems(lote: LoteProduccionUI) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        onSelect: () => openUpdateModal(lote.id),
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
    <h1>Lotes de Producción</h1>
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

        <NewLote />
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
  </div>
</template>
