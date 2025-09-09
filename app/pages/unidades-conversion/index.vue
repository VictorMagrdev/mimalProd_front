<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import GetUnidadesConversion from "~/graphql/unidades-conversion/get-unidades-conversion.graphql";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface UnidadConversion {
  id: string;
  origen: { id: string; nombre: string };
  destino: { id: string; nombre: string };
  factor: number;
}

const {
  data,
  pending,
  error,
  refresh: refetch,
} = await useAsyncQuery(GetUnidadesConversion);

const conversiones = computed(() => data.value?.unidadesConversion || []);
const toast = useToast();

const columns: TableColumn<UnidadConversion>[] = [
  {
    accessorKey: "origen.nombre",
    header: "Origen",
    cell: ({ row }: { row: Row<UnidadConversion> }) => row.original.origen.nombre,
  },
  {
    accessorKey: "destino.nombre",
    header: "Destino",
    cell: ({ row }) => row.original.destino.nombre,
  },
  {
    accessorKey: "factor",
    header: "Factor",
    cell: ({ row }) => row.original.factor,
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

function getRowItems(conv: UnidadConversion) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(conv.id),
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
  toast.add({ title: "Conversión creada", color: "success" });
}

function handleUpdated() {
  selectedId.value = null;
  refetch();
  toast.add({ title: "Conversión actualizada", color: "success" });
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Conversión de Unidades</h1>

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

        <UButton label="Nueva Conversión" @click="isNewModalOpen = true" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="conversiones || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="conversiones?.length || 0"
        />
      </div>
    </div>

    <UnidadesConversionNewConversion
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
      @created="handleCreated"
    />
    <UnidadesConversionUpdateConversion
      :is-open="!!selectedId"
      :conversion-id="selectedId"
      @close="selectedId = null"
      @updated="handleUpdated"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
