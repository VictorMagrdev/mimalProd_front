<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, ref } from "vue";

const GetReservasMaterialOrden = gql`
  query GetReservasMaterialOrden {
    reservasMaterialOrden {
      id
      ordenId
      productoId
      loteId
      cantidadReservada
      unidadId
      fechaReserva
    }
  }
`;

export interface ReservaMaterialOrden {
  id: string;
  ordenId: string | null;
  productoId: string | null;
  loteId: string | null;
  cantidadReservada: number;
  unidadId: string | null;
  fechaReserva: string | null;
}

interface ReservaMaterialOrdenResult {
  reservasMaterialOrden: ReservaMaterialOrden[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<ReservaMaterialOrdenResult>(GetReservasMaterialOrden);

const reservasMaterialOrden = computed(
  () => data.value?.reservasMaterialOrden || [],
);

const columns: TableColumn<ReservaMaterialOrden>[] = [
  {
    accessorKey: "ordenId",
    header: "ID Orden",
    cell: ({ row }: { row: Row<ReservaMaterialOrden> }) =>
      row.original.ordenId || "-",
  },
  {
    accessorKey: "productoId",
    header: "ID Producto",
    cell: ({ row }) => row.original.productoId || "-",
  },
  {
    accessorKey: "loteId",
    header: "ID Lote",
    cell: ({ row }) => row.original.loteId || "-",
  },
  {
    accessorKey: "cantidadReservada",
    header: "Cantidad Reservada",
    cell: ({ row }) => row.original.cantidadReservada,
  },
  {
    accessorKey: "unidadId",
    header: "Unidad",
    cell: ({ row }) => row.original.unidadId || "-",
  },
  {
    accessorKey: "fechaReserva",
    header: "Fecha Reserva",
    cell: ({ row }) => row.original.fechaReserva || "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold pl-8 pt-4">Órdenes de Reserva de Material</h1>

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

        <ReservaMaterialOrdenNewReservaMaterialOrden @creado="refresh()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="reservasMaterialOrden || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="reservasMaterialOrden?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
