<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetTiposCosto from "~/graphql/tipos-costo/get-tipos-costo.graphql";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface TipoCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetTiposCosto);

const tiposCosto = computed(() => data.value?.tiposCosto || []);

const toast = useToast();

const columns: TableColumn<TipoCosto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<TipoCosto> }) => row.original.codigo,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion,
  },
  {
    accessorKey: "activo",
    header: "Activo",
    cell: ({ row }) => (row.original.activo ? "Sí" : "No"),
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

function getRowItems(tipo: TipoCosto) {
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

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();

const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}

function handleCreated() {
  isNewModalOpen.value = false;
  refetch();
  toast.add({ title: "Tipo de costo creado", color: "success" });
}

function handleUpdated() {
  selectedId.value = null;
  refetch();
  toast.add({ title: "Tipo de costo actualizado", color: "success" });
}
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
                    ?.toggleVisibility(!!checked);
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

        <UButton label="Nuevo Tipo de Costo" @click="isNewModalOpen = true" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="tiposCosto || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="tiposCosto?.length || 0"
        />
      </div>
    </div>

    <TiposCostoNewTipoCosto
      v-model:open="isNewModalOpen"
      @created="handleCreated"
    />
    <TiposCostoUpdateTipoCosto
      :is-open="!!selectedId"
      :tipo-costo-id="selectedId"
      @close="selectedId = null"
      @updated="handleUpdated"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
