<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";
import type { EstadoOrden } from "~/utils/types";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");


const query = gql`
  query getEstadosOrden {
    estadosOrden {
      id
      codigo
      nombre
      descripcion
      activo
      creadoEn
    }
  }
`;

const { data, pending, error } = await useAsyncQuery<{
  estadosOrden: EstadoOrden[];
}>(query);

const rows = computed<EstadoOrden[]>(() => data.value?.estadosOrden || []);

const columns: TableColumn<EstadoOrden>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<EstadoOrden> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }: { row: Row<EstadoOrden> }) => row.original.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }: { row: Row<EstadoOrden> }) => row.original.descripcion,
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<EstadoOrden> }) =>
      h(
        UBadge,
        {
          color: row.original.activo ? "success" : "neutral",
          variant: "subtle",
          class: "capitalize",
        },
        () => (row.original.activo ? "Activo" : "Inactivo"),
      ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }: { row: Row<EstadoOrden> }) =>
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
    <h1 class="text-2xl font-bold">Estados de Orden</h1>

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

        <NewEstadoOrden />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="rows || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="rows?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
