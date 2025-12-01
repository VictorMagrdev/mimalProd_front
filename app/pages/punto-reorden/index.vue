<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, ref } from "vue";
import NewPuntoReorden from "~/components/punto-reorden/NewPuntoReorden.vue";

const GetPuntosReorden = gql`
  query GetPuntosReorden {
    puntosReorden {
      id
      productoId
      stockMinimo
      stockSeguridad
      unidadId
    }
  }
`;

export interface PuntoReorden {
  id: string;
  producto_id: string | null;
  stock_minimo: number;
  stock_seguridad: number | null;
  unidad_id: string | null;
}

interface PuntoReordenResult {
  puntosReorden: PuntoReorden[];
}

const { data, pending, error, execute } =
  await useAsyncQuery<PuntoReordenResult>(GetPuntosReorden);

const puntosReorden = computed(() => data.value?.puntosReorden || []);

const columns: TableColumn<PuntoReorden>[] = [
  {
    accessorKey: "producto_id",
    header: "ID Producto",
    cell: ({ row }: { row: Row<PuntoReorden> }) =>
      row.original.producto_id || "-",
  },
  {
    accessorKey: "stock_minimo",
    header: "Stock Mínimo",
    cell: ({ row }) => row.original.stock_minimo,
  },
  {
    accessorKey: "stock_seguridad",
    header: "Stock de Seguridad",
    cell: ({ row }) => row.original.stock_seguridad ?? "-",
  },
  {
    accessorKey: "unidad_id",
    header: "Unidad ID",
    cell: ({ row }) => row.original.unidad_id || "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold pl-8 pt-4">Puntos de Reorden</h1>

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
        <NewPuntoReorden @creado="execute()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="puntosReorden || []"
        :columns="columns"
        :loading="pending"
        sticky
        class="flex-1 overflow-auto h-96"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="puntosReorden?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
