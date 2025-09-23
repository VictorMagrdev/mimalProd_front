<script setup lang="ts">
import { ref, computed, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetOrdenesEvento from "~/graphql/orden-evento/get-ordenes-evento.graphql";

interface Orden {
  id: string;
  numeroOrden: string;
}

export interface OrdenEvento {
  id: string;
  orden: Orden;
  evento: string;
  fecha: string;
}
interface OrdenEventoResult {
  ordenesEvento: OrdenEvento[];
}
const { data, pending, error } =
  await useAsyncQuery<OrdenEventoResult>(GetOrdenesEvento);
const ordenesEvento = computed(() => data.value?.ordenesEvento || []);

// columnas tipadas
const columns: TableColumn<OrdenEvento>[] = [
  {
    accessorKey: "orden.numeroOrden",
    header: "N° Orden",
    cell: ({ row }: { row: Row<OrdenEvento> }) =>
      row.original.orden.numeroOrden,
  },
  {
    accessorKey: "evento",
    header: "Evento",
    cell: ({ row }) => row.original.evento,
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => row.original.fecha,
  },
];
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>
<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Orden evento</h1>

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
        :data="ordenesEvento || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="ordenesEvento?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
