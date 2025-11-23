<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const GetTiposBodega = gql`
  query GetTiposBodega {
    tiposBodega {
      id
      codigo
      nombre
      descripcion
    }
  }
`;

interface TipoBodega {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

interface TiposBodegaResult {
  tiposBodega: TipoBodega[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<TiposBodegaResult>(GetTiposBodega, {});

const tiposBodega = computed(() => data.value?.tiposBodega || []);

const columns: TableColumn<TipoBodega>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<TipoBodega> }) =>
      h(
        "span",
        { class: "font-mono text-sm bg-gray-100 px-2 py-1 rounded" },
        row.original.codigo,
      ),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => row.original.nombre,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) =>
      row.original.descripcion
        ? row.original.descripcion
        : h("span", { class: "text-gray-400 italic" }, "Sin descripción"),
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    cell: ({ row }: { row: Row<TipoBodega> }) =>
      h(
        "div",
        { class: "flex justify-center" },
        h(
          UDropdownMenu,
          {
            items: getRowItems(row.original),
            content: { align: "end" },
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              size: "sm",
            }),
        ),
      ),
  },
];

function getRowItems(tipo: TipoBodega) {
  return [
    [
      {
        label: "Editar",
        icon: "i-lucide-edit",
        onSelect: () => openUpdateModal(tipo.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
const selectedId = ref<string | null>(null);
const isNewModalOpen = ref(false);

function openUpdateModal(id: string) {
  selectedId.value = id;
}

const filteredData = computed(() => {
  if (!globalFilter.value) return tiposBodega.value;
  const filter = globalFilter.value.toLowerCase();
  return tiposBodega.value.filter(
    (t) =>
      t.codigo.toLowerCase().includes(filter) ||
      t.nombre.toLowerCase().includes(filter) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(filter)),
  );
});
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tipos de Bodega</h1>
        <p class="text-gray-600 mt-1">
          Gestiona los diferentes tipos de bodega registrados
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Buscar por código o nombre..."
          icon="i-lucide-search"
        />

        <div class="flex items-center gap-2">
          <UDropdownMenu
            v-if="table?.tableApi"
            :items="
              table?.tableApi
                .getAllColumns()
                .filter((column: Column<TipoBodega>) => column.getCanHide())
                .map((column: Column<TipoBodega>) => ({
                  label:
                    column.id === 'codigo'
                      ? 'Código'
                      : column.id === 'nombre'
                        ? 'Nombre'
                        : column.id === 'descripcion'
                          ? 'Descripción'
                          : column.id,
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked: (checked: boolean) =>
                    column.toggleVisibility(checked),
                  onSelect: (e?: Event) => e?.preventDefault(),
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

          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            :loading="pending"
            @click="refresh()"
          />

          <NewTipoBodega v-model="isNewModalOpen" @creado="refresh()" />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="filteredData"
        :columns="columns"
        :loading="pending"
        class="w-full"
        :ui="{
          tbody: 'divide-y divide-gray-200',
          td: 'px-4 py-3 text-sm',
          th: 'px-4 py-3 text-sm font-semibold text-gray-900 bg-gray-50',
        }"
      />

      <div
        class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="text-sm text-gray-600">
          Mostrando
          <span class="font-medium">{{
            Math.min(pagination.pageSize, filteredData.length)
          }}</span>
          de
          <span class="font-medium">{{ filteredData.length }}</span>
          tipos de bodega
        </div>

        <UPagination
          :page-count="pagination.pageSize"
          :total="filteredData.length"
        />
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2 text-red-800">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
        <span class="font-medium">Error al cargar los tipos de bodega</span>
      </div>
      <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
      <UButton
        color="red"
        variant="outline"
        size="sm"
        class="mt-2"
        @click="refresh()"
      >
        Reintentar
      </UButton>
    </div>
  </div>
</template>
