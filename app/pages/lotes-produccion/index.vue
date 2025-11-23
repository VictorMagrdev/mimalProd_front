<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";

const GetLotesProduccion = gql`
  query GetLotesProduccion {
    lotesProduccion {
      id
      numeroLote
      productoId
      fabricadoEn
      venceEn
      creadoEn
      producto {
        id
        nombre
      }
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface LoteProduccion {
  id: string;
  numeroLote: string;
  producto_id?: string | null;
  fabricado_en?: string | null;
  vence_en?: string | null;
  creadoEn?: string | null;
  producto?: { id: string; nombre?: string } | null;
}

interface LotesProduccionResult {
  lotesProduccion: LoteProduccion[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<LotesProduccionResult>(GetLotesProduccion);

const lotesProduccion = computed(() => data.value?.lotesProduccion || []);

const columns: TableColumn<LoteProduccion>[] = [
  {
    accessorKey: "numero_lote",
    header: "Número de Lote",
    cell: ({ row }: { row: Row<LoteProduccion> }) => row.original.numeroLote,
  },
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }) => row.original.producto?.nombre ?? "-",
  },
  {
    accessorKey: "fabricado_en",
    header: "Fabricado en",
    cell: ({ row }) =>
      row.original.fabricado_en
        ? new Date(row.original.fabricado_en).toLocaleDateString("es-CO")
        : "-",
  },
  {
    accessorKey: "vence_en",
    header: "Vence en",
    cell: ({ row }) =>
      row.original.vence_en
        ? new Date(row.original.vence_en).toLocaleDateString("es-CO")
        : "-",
  },
  {
    accessorKey: "creadoEn",
    header: "Creado en",
    cell: ({ row }) =>
      row.original.creadoEn
        ? new Date(row.original.creadoEn).toLocaleDateString("es-CO")
        : "-",
  },
  {
    id: "actions",
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

function getRowItems(lote: LoteProduccion) {
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
    <h1 class="text-2xl font-bold pl-8 pt-4">Lotes de Producción</h1>

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

        <LotesProduccionNewLoteProduccion
          v-model="isNewModalOpen"
          @creado="refresh()"
        />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="lotesProduccion || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="lotesProduccion?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
