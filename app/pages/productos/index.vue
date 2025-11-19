<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const GetProductos = gql`
  query GetProductos {
    productos {
      id
      codigo
      nombre
      costoBase
      creadoEn
      tipo {
        id
        nombre
      }
      metodoValoracion {
        id
        nombre
      }
      unidadBase {
        id
        nombre
      }
    }
  }
`;

export interface TipoProducto {
  id: string;
  nombre: string;
}

export interface MetodoValoracion {
  id: string;
  nombre: string;
}

export interface UnidadMedida {
  id: string;
  nombre: string;
}

export interface Producto {
  id: string;
  codigo: string | null;
  nombre: string;
  costo_base: number | null;
  creadoEn: string;
  tipo: TipoProducto | null;
  metodo_valoracion: MetodoValoracion | null;
  unidad_base: UnidadMedida | null;
}

interface ProductosResult {
  productos: Producto[];
}

const { data, pending, error } =
  await useAsyncQuery<ProductosResult>(GetProductos);
const productos = computed(() => data.value?.productos ?? []);

function openUpdateModal(id: string) {
  selectedProductoId.value = id;
  isUpdateOpen.value = true;
}

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

const columns: TableColumn<Producto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<Producto> }) => row.original.codigo ?? "-",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "tipo.nombre",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo?.nombre ?? "-",
  },
  {
    accessorKey: "metodo_valoracion.nombre",
    header: "Método de Valoración",
    cell: ({ row }) => row.original.metodo_valoracion?.nombre ?? "-",
  },
  {
    accessorKey: "unidad_base.nombre",
    header: "Unidad Base",
    cell: ({ row }) => row.original.unidad_base?.nombre ?? "-",
  },
  {
    accessorKey: "costo_base",
    header: "Costo Base",
    cell: ({ row }) => row.original.costo_base ?? "-",
  },
  {
    accessorKey: "creadoEn",
    header: "Creado En",
    cell: ({ row }) =>
      new Date(row.original.creadoEn).toLocaleDateString("es-CO"),
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
        :loading="pending"
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
