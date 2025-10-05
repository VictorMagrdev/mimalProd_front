<script setup lang="ts">
import { ref, h, resolveComponent, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row, Column } from "@tanstack/vue-table";
import GetEstadosOrden from "~/graphql/estados-orden/get-estados-orden.graphql";
import NewEstadoOrden from "~/components/estados-orden/NewEstadoOrden.vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

interface EstadoOrden {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  creado_en?: string;
}

interface EstadosOrdenResult {
  estadosOrden: EstadoOrden[];
}

const { data, pending, error, refresh } = await useAsyncQuery<EstadosOrdenResult>(
  GetEstadosOrden,
  {}
);

const rows = computed<EstadoOrden[]>(() => data.value?.estadosOrden || []);

const columns: TableColumn<EstadoOrden>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<EstadoOrden> }) => 
      h("span", { class: "font-mono text-sm" }, row.original.codigo),
    meta: {
      class: {
        th: "w-32",
      },
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }: { row: Row<EstadoOrden> }) => 
      h("span", { class: "font-medium" }, row.original.nombre),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }: { row: Row<EstadoOrden> }) => 
      row.original.descripcion || h("span", { class: "text-gray-400" }, "Sin descripción"),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<EstadoOrden> }) => 
      h(UBadge, {
        color: row.original.activo ? "success" : "neutral",
        variant: "subtle",
        class: "capitalize"
      }, () => row.original.activo ? "Activo" : "Inactivo"),
    meta: {
      class: {
        th: "w-24",
        td: "text-center",
      },
    },
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
    cell: ({ row }: { row: Row<EstadoOrden> }) =>
      h(
        "div",
        { class: "flex justify-center" },
        h(UDropdownMenu, { 
          items: getRowItems(row.original),
          content: { align: "end" }
        }, () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            "aria-label": `Acciones para ${row.original.nombre}`,
          }),
        ),
      ),
  },
];

function getRowItems(estado: EstadoOrden) {
  return [
    [
      {
        label: "Editar",
        icon: "i-lucide-edit",
        onSelect: () => openUpdateModal(estado.id),
      },
      {
        label: estado.activo ? "Desactivar" : "Activar",
        icon: estado.activo ? "i-lucide-toggle-left" : "i-lucide-toggle-right",
        onSelect: () => toggleEstado(estado),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
const selectedId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedId.value = id;
  // Aquí podrías abrir un modal de edición
  console.log("Editar estado:", id);
}

function toggleEstado(estado: EstadoOrden) {
  // Aquí implementarías la mutación para cambiar el estado
  console.log("Cambiar estado de:", estado.id, "a:", !estado.activo);
}

// Computed para el paginador
const totalItems = computed(() => rows.value.length);
const currentPage = computed({
  get: () => pagination.value.pageIndex + 1,
  set: (page) => {
    pagination.value.pageIndex = page - 1;
  },
});
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Estados de Orden</h1>
        <p class="text-gray-600 mt-1">
          Gestiona los diferentes estados que pueden tener las órdenes de producción
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <!-- Header con filtros y acciones -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Filtrar por código, nombre..."
          icon="i-lucide-search"
        />

        <div class="flex items-center gap-2">
          <UDropdownMenu
            v-if="table?.tableApi"
            :items="
              table.tableApi
                .getAllColumns()
                .filter((column: Column<EstadoOrden>) => column.getCanHide())
                .map((column: Column<EstadoOrden>) => ({
                  label: column.id === 'codigo' ? 'Código' : 
                         column.id === 'nombre' ? 'Nombre' :
                         column.id === 'descripcion' ? 'Descripción' :
                         column.id === 'activo' ? 'Estado' : column.id,
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked: (checked: boolean) => {
                    column.toggleVisibility(checked);
                  },
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

          <NewEstadoOrden />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="rows"
        :columns="columns"
        :loading="pending"
        class="w-full"
      />

      <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-600">
          Mostrando {{ Math.min(pagination.pageSize, rows.length) }} de {{ totalItems }} registros
        </div>
        
        <UPagination
          v-model="currentPage"
          :page-count="pagination.pageSize"
          :total="totalItems"
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
        <span class="font-medium">Error al cargar los estados de orden</span>
      </div>
      <p class="text-red-600 text-sm mt-1">{{ error.message }}</p>
      <UButton
        color="red"
        variant="outline"
        class="mt-2"
        @click="refresh()"
      >
        Reintentar
      </UButton>
    </div>
  </div>
</template>