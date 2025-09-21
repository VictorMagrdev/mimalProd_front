<script setup lang="ts">
import { ref,} from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetReservasMaterialOrden from "~/graphql/reserva-material-orden/get-reservas-material-orden.graphql";

interface Orden {
  id: string;
  numeroOrden: string;
}

interface Material {
  id: string;
  nombre: string;
}

export interface ReservaMaterialOrden {
  id: string;
  orden: Orden;
  material: Material;
  cantidadReservada: number;
}
interface ReservaMaterialOrdenResult {
  reservasMaterialOrden: ReservaMaterialOrden[];
}
const {
  data,
  pending,
  error,
} = await useAsyncQuery<ReservaMaterialOrdenResult>(GetReservasMaterialOrden);
const reservasMaterialOrden = computed(() => data.value?.reservasMaterialOrden || []);

// columnas tipadas
const columns: TableColumn<ReservaMaterialOrden>[] = [
  {
    accessorKey: "orden.numeroOrden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<ReservaMaterialOrden> }) => row.original.orden.numeroOrden,
  },
  {
    accessorKey: "material.nombre",
    header: "Material",
    cell: ({ row }) => row.original.material.nombre,
  },
  {
    accessorKey: "cantidadReservada",
    header: "Cantidad Reservada",
    cell: ({ row }) => row.original.cantidadReservada,
  }
];
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Tipos de Costo</h1>

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
