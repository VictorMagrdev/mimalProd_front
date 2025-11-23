<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const GetUnidadesMedida = gql`
  query GetUnidadesMedida {
    unidadesMedida {
      id
      codigo
      nombre
      abreviatura
      tipo {
        id
        nombre
      }
      activa
      base
      creadoEn
    }
  }
`;

export interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  abreviatura?: string;
  tipo?: { id: string; nombre: string };
  activa?: boolean;
  base?: boolean;
  creadoEn?: string;
}

interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<UnidadesMedidaResult>(GetUnidadesMedida);

const unidades = computed(() => data.value?.unidadesMedida || []);

const columns: TableColumn<UnidadMedida>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<UnidadMedida> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "abreviatura",
    header: "Abreviatura",
    cell: ({ row }) => row.original.abreviatura || "-",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => row.original.tipo?.nombre || "-",
  },
  {
    accessorKey: "activa",
    header: "Activa",
    cell: ({ row }) => (row.original.activa ? "Sí" : "No"),
  },
  {
    accessorKey: "base",
    header: "Base",
    cell: ({ row }) => (row.original.base ? "Sí" : "No"),
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

function getRowItems(unidad: UnidadMedida) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(unidad.id),
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
    <h1 class="text-2xl font-bold pl-8 pt-4">Unidades de Medida</h1>

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

        <UnidadesMedidaNewUnidad @creado="refresh()" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="unidades || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="
            Math.max(
              1,
              Math.ceil((unidades?.length || 0) / pagination.pageSize),
            )
          "
          :total="unidades?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
