<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row, Column } from "@tanstack/vue-table";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const GetTiposCosto = gql`
  query GetTiposCosto {
    tiposCosto {
      id
      codigo
      nombre
      descripcion
      activo
      creado_en
    }
  }
`;

interface TipoCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creado_en?: string;
}

interface TiposCostoResult {
  tiposCosto: TipoCosto[];
}

const { data, pending, error, refresh } = await useAsyncQuery<TiposCostoResult>(
  GetTiposCosto,
  {},
);

const tiposCosto = computed(() => data.value?.tiposCosto || []);

const columns: TableColumn<TipoCosto>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<TipoCosto> }) =>
      h(
        "span",
        { class: "font-mono text-sm bg-gray-100 px-2 py-1 rounded" },
        row.original.codigo,
      ),
    meta: {
      class: {
        th: "w-32",
        td: "font-medium",
      },
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }: { row: Row<TipoCosto> }) =>
      h("span", { class: "font-semibold text-gray-900" }, row.original.nombre),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }: { row: Row<TipoCosto> }) =>
      row.original.descripcion
        ? h("span", { class: "text-gray-600" }, row.original.descripcion)
        : h("span", { class: "text-gray-400 italic" }, "Sin descripción"),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<TipoCosto> }) =>
      h(
        UBadge,
        {
          color: row.original.activo ? "emerald" : "gray",
          variant: "subtle",
          class: "capitalize text-xs",
        },
        () => (row.original.activo ? "Activo" : "Inactivo"),
      ),
    meta: {
      class: {
        th: "w-24 text-center",
        td: "text-center",
      },
    },
  },
  {
    accessorKey: "creado_en",
    header: "Creado en",
    cell: ({ row }: { row: Row<TipoCosto> }) =>
      h(
        "span",
        { class: "text-gray-500 text-sm" },
        row.original.creado_en
          ? new Date(row.original.creado_en).toLocaleDateString("es-CO")
          : "-",
      ),
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    meta: {
      class: {
        th: "w-20",
        td: "text-center",
      },
    },
    cell: ({ row }: { row: Row<TipoCosto> }) =>
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
              "aria-label": `Acciones para ${row.original.nombre}`,
            }),
        ),
      ),
  },
];

function getRowItems(tipo: TipoCosto) {
  return [
    [
      {
        label: "Editar",
        icon: "i-lucide-edit",
        onSelect: () => openUpdateModal(tipo.id),
      },
      {
        label: tipo.activo ? "Desactivar" : "Activar",
        icon: tipo.activo ? "i-lucide-toggle-left" : "i-lucide-toggle-right",
        color: tipo.activo ? "orange" : "emerald",
        onSelect: () => toggleEstado(tipo),
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

function toggleEstado(tipo: TipoCosto) {
  console.log("Cambiar estado de:", tipo.id, "a:", !tipo.activo);
}

const filteredData = computed(() => {
  if (!globalFilter.value) return tiposCosto.value;
  const filter = globalFilter.value.toLowerCase();
  return tiposCosto.value.filter(
    (tipo) =>
      tipo.codigo.toLowerCase().includes(filter) ||
      tipo.nombre.toLowerCase().includes(filter) ||
      (tipo.descripcion && tipo.descripcion.toLowerCase().includes(filter)),
  );
});
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tipos de Costo</h1>
        <p class="text-gray-600 mt-1">
          Gestiona los diferentes tipos de costos para las órdenes de producción
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Buscar por código, nombre..."
          icon="i-lucide-search"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        />

        <div class="flex items-center gap-2">
          <UDropdownMenu
            v-if="table?.tableApi"
            :items="
              table.tableApi
                .getAllColumns()
                .filter((column: Column<TipoCosto>) => column.getCanHide())
                .map((column: Column<TipoCosto>) => ({
                  label:
                    column.id === 'codigo'
                      ? 'Código'
                      : column.id === 'nombre'
                        ? 'Nombre'
                        : column.id === 'descripcion'
                          ? 'Descripción'
                          : column.id === 'activo'
                            ? 'Estado'
                            : column.id === 'creado_en'
                              ? 'Creado en'
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
              aria-label="Mostrar/ocultar columnas"
            />
          </UDropdownMenu>

          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            :loading="pending"
            aria-label="Refrescar datos"
            @click="refresh()"
          />

          <NewTipoCosto v-model="isNewModalOpen" @creado="refresh()" />
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

      <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-600">
          Mostrando
          <span class="font-medium">{{
            Math.min(pagination.pageSize, filteredData.length)
          }}</span>
          de
          <span class="font-medium">{{ filteredData.length }}</span>
          tipos de costo
        </div>

        <UPagination
          :page-count="pagination.pageSize"
          :total="filteredData.length"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-8 w-8 h-8',
          }"
        />
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2 text-red-800">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
        <span class="font-medium">Error al cargar los tipos de costo</span>
      </div>
      <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
      <UButton color="red" variant="outline" size="sm" class="mt-2" @click="refresh()">
        Reintentar
      </UButton>
    </div>
  </div>
</template>
