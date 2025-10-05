<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const GetMetodosValoracion = gql`
  query GetMetodosValoracion {
    metodosValoracion {
      id
      codigo
      nombre
      descripcion
      productos {
        id
        nombre
      }
    }
  }
`;

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface Producto {
  id: string;
  nombre: string;
}

export interface MetodoValoracion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  productos?: Producto[] | null;
}

interface MetodoValoracionResult {
  metodosValoracion: MetodoValoracion[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<MetodoValoracionResult>(GetMetodosValoracion);

const metodosValoracion = computed(() => data.value?.metodosValoracion || []);

const columns: TableColumn<MetodoValoracion>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<MetodoValoracion> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion || "-",
  },
  {
    accessorKey: "productos",
    header: "Productos Asociados",
    cell: ({ row }) =>
      row.original.productos?.length
        ? row.original.productos.map((p) => p.nombre).join(", ")
        : "Sin productos",
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

function getRowItems(tipo: MetodoValoracion) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(tipo.id),
      },
    ],
  ];
}

function onCreated() {
  refresh?.().catch((err) => console.error("Error refrescando:", err));
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Métodos de valoración</h1>

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
        <NewMetodoValoracion @creado="onCreated" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="metodosValoracion || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="metodosValoracion?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
