<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";

const GetLineasOrden = gql`
  query GetLineasOrden {
    LineasOrden {
      id
      ordenId
      numeroLinea
      productoComponente {
        id
        nombre
      }
      cantidadRequerida
      unidadComponente {
        id
        abreviatura
      }
      cantidadUsada
      costoUnitario
      costoTotal
      observaciones
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface LineaOrden {
  id: string;
  ordenId?: string | null;
  numeroLinea?: number | null;
  productoComponente?: { id: string; nombre?: string } | null;
  cantidadRequerida?: number | null;
  unidadComponente?: { id: string; abreviatura?: string } | null;
  cantidadUsada?: number | null;
  costoUnitario?: number | null;
  costoTotal?: number | null;
  observaciones?: string | null;
}

interface LineasOrdenResult {
  LineasOrden: LineaOrden[];
}

const { data, pending, error, execute } =
  await useAsyncQuery<LineasOrdenResult>(GetLineasOrden);
const lineasOrden = computed(() => data.value?.LineasOrden || []);
const columns: TableColumn<LineaOrden>[] = [
  {
    accessorKey: "ordenId",
    header: "Orden ID",
    cell: ({ row }: { row: Row<LineaOrden> }) => row.original.ordenId ?? "-",
  },
  {
    accessorKey: "numeroLinea",
    header: "N° Línea",
    cell: ({ row }) => row.original.numeroLinea ?? "-",
  },
  {
    accessorKey: "productoComponente.nombre",
    header: "Componente",
    cell: ({ row }) => row.original.productoComponente?.nombre ?? "-",
  },
  {
    accessorKey: "cantidadRequerida",
    header: "Cant. Requerida",
    cell: ({ row }) => row.original.cantidadRequerida ?? "-",
  },
  {
    accessorKey: "unidadComponente.abreviatura",
    header: "Unidad",
    cell: ({ row }) => row.original.unidadComponente?.abreviatura ?? "-",
  },
  {
    accessorKey: "cantidadUsada",
    header: "Cant. Usada",
    cell: ({ row }) => row.original.cantidadUsada ?? "-",
  },
  {
    accessorKey: "costoUnitario",
    header: "Costo Unitario",
    cell: ({ row }) => row.original.costoUnitario ?? "-",
  },
  {
    accessorKey: "costoTotal",
    header: "Costo Total",
    cell: ({ row }) => row.original.costoTotal ?? "-",
  },
  {
    accessorKey: "observaciones",
    header: "Observaciones",
    cell: ({ row }) => row.original.observaciones ?? "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          { items: getRowItems(row.original), content: { align: "end" } },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
            }),
        ),
      ),
  },
];

function getRowItems(linea: LineaOrden) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        onSelect: () => openUpdateModal(linea.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref("");
const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold pl-8 pt-4">Líneas de Orden</h1>

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

        <LineasOrdenNewLinea @creado="execute()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="lineasOrden"
        :columns="columns"
        :loading="pending"
        sticky
        class="flex-1 overflow-auto h-96"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="
            Math.max(
              1,
              Math.ceil((lineasOrden?.length || 0) / pagination.pageSize),
            )
          "
          :total="lineasOrden?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
