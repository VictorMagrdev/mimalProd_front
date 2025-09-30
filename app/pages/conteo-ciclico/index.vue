<script setup lang="ts">
import { ref, computed, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetConteosCiclicos from "~/graphql/conteo-ciclico/get-conteos-ciclicos.graphql";

interface Producto {
  id: string;
  nombre: string;
}

export interface ConteoCiclico {
  id: string;
  producto: Producto;
  fecha: string;
  cantidadContada: number;
}

interface ConteoCiclicoResult {
  conteosCiclicos: ConteoCiclico[];
}

const { data, pending, error } =
  await useAsyncQuery<ConteoCiclicoResult>(GetConteosCiclicos);

const conteosCiclicos = computed(() => data.value?.conteosCiclicos || []);

const columns: TableColumn<ConteoCiclico>[] = [
  {
    accessorKey: "producto.nombre",
    header: "Producto",
    cell: ({ row }: { row: Row<ConteoCiclico> }) =>
      row.original.producto.nombre,
  },
  {
    accessorKey: "fechaConteo",
    header: "Fecha de Conteo",
    cell: ({ row }) => row.original.fecha,
  },
  {
    accessorKey: "cantidadContada",
    header: "Cantidad Contada",
    cell: ({ row }) => row.original.cantidadContada,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          "button",
          {
            class: "text-primary hover:underline",
            onClick: () => openUpdateModal(row.original.id),
          },
          "Actualizar",
        ),
      ),
  },
];

const updateModalOpen = ref(false);

const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
  updateModalOpen.value = true;
}
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Conteo ciclico</h1>

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
              .filter((column:any) => column.getCanHide())
              .map((column:any) => ({
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
        :data="conteosCiclicos || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="conteosCiclicos?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
