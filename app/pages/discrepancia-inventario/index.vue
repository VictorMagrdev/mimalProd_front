<script setup lang="ts">
import { ref, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetDiscrepanciasInventario from "~/graphql/discrepancia-inventario/get-discrepancias-inventario.graphql";

interface Producto {
  id: string;
  nombre: string;
}

export interface ConteoCiclico {
  fecha: string;
  producto: Producto;
}

export interface DiscrepanciaInventario {
  id: string;
  cantidadSistema: number;     // antes: cantidadEsperada
  cantidadContada: number;     // antes: cantidadReal
  diferencia: number;
  resuelto: boolean;
  conteo: ConteoCiclico;
}

interface DiscrepanciaInventarioResult {
  discrepanciasInventario: DiscrepanciaInventario[];
}

const { data, pending, error } =
  await useAsyncQuery<DiscrepanciaInventarioResult>(GetDiscrepanciasInventario);

const discrepanciasInventarios = computed(
  () => data.value?.discrepanciasInventario || [],
);

// columnas tipadas
const columns: TableColumn<DiscrepanciaInventario>[] = [
  {
    accessorKey: "conteo.producto.nombre",
    header: "Producto",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      row.original.conteo.producto.nombre,
  },
  {
    accessorKey: "cantidadSistema",
    header: "Cantidad Esperada",
    cell: ({ row }) => row.original.cantidadSistema,
  },
  {
    accessorKey: "cantidadContada",
    header: "Cantidad Real",
    cell: ({ row }) => row.original.cantidadContada,
  },
  {
    accessorKey: "conteo.fecha",
    header: "Fecha",
    cell: ({ row }) => row.original.conteo.fecha,
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>


<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Discrepacia inventario</h1>

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
        :data="discrepanciasInventarios || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="discrepanciasInventarios?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
