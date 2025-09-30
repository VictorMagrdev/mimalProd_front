<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import getProductos from "~/graphql/productos/get-productos.graphql";
import NewProducto from "~/components/productos/NewProducto.vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  costoBase: number;
  unidadBase: { id: string; nombre: string };
}

const { result, loading, error } = useQuery(getProductos);
const productos = computed(() => result.value?.productos ?? []);

function openUpdateModal(id: string) {
  selectedProductoId.value = id;
  isUpdateOpen.value = true;
}

const columns: TableColumn<Producto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<Producto> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "costoBase",
    header: "Costo Base",
    cell: ({ row }) => row.original.costoBase,
  },
  {
    accessorKey: "unidadBase.nombre",
    header: "Unidad Base",
    cell: ({ row }) => row.original.unidadBase.nombre,
  },
  {
    id: "actions",
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

function getRowItems(producto: Producto) {
  return [
    [
      {
        label: "Editar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(producto.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();

const isUpdateOpen = ref(false);
const selectedProductoId = ref<string | null>(null);
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Productos</h1>

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

        <NewProducto />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="productos || []"
        :columns="columns"
        :loading="loading"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="productos?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
