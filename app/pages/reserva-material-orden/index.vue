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
  orden_id: string | null;
  producto_id: string | null;
  lote_id: string | null;
  cantidad_reservada: number;
  unidad_id: string | null;
  fecha_reserva: string | null;
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
    accessorKey: "orden_id",
    header: "ID Orden",
    cell: ({ row }: { row: Row<ReservaMaterialOrden> }) =>
      row.original.orden_id || "-",
  },
  {
    accessorKey: "producto_id",
    header: "ID Producto",
    cell: ({ row }) => row.original.producto_id || "-",
  },
  {
    accessorKey: "lote_id",
    header: "ID Lote",
    cell: ({ row }) => row.original.lote_id || "-",
  },
  {
    accessorKey: "cantidad_reservada",
    header: "Cantidad Reservada",
    cell: ({ row }) => row.original.cantidad_reservada,
  },
  {
    accessorKey: "unidad_id",
    header: "Unidad",
    cell: ({ row }) => row.original.unidad_id || "-",
  },
  {
    accessorKey: "fecha_reserva",
    header: "Fecha Reserva",
    cell: ({ row }) => row.original.fecha_reserva || "-",
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
