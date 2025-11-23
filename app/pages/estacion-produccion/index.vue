<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { computed, h, ref, resolveComponent } from "vue";
import type { EstacionProduccion } from "~/utils/types";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const query = gql`
  query getEstacionesProduccion {
    estacionesProduccion {
      id
      codigo
      nombre
      descripcion
      orden
      creadoEn
    }
  }
`;

interface QueryResult {
  estacionesProduccion: EstacionProduccion[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);

const estacionesProduccion = computed(
  () => data.value?.estacionesProduccion || [],
);

const columns: TableColumn<EstacionProduccion>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
      h("div", { class: "font-mono text-sm" }, row.original.codigo),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
      h("div", { class: "font-medium text-highlighted" }, row.original.nombre),
  },
  {
    accessorKey: "orden",
    header: "Orden",
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
      h(
        UBadge,
        { variant: "outline", color: "primary", class: "font-mono" },
        () => `#${row.original.orden}`,
      ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
      row.original.descripcion ||
      h("span", { class: "text-muted italic" }, "Sin descripción"),
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.creadoEn).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }: { row: Row<EstacionProduccion> }) =>
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
              class: "ml-auto",
              "aria-label": "Acciones",
            }),
        ),
      ),
  },
];

function getRowItems(estacion: EstacionProduccion) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(estacion.id),
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
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold pl-8 pt-4">Estaciones de Producción</h1>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar estaciones..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label:
                column.id === 'codigo'
                  ? 'Código'
                  : column.id === 'nombre'
                    ? 'Nombre'
                    : column.id === 'orden'
                      ? 'Orden'
                      : column.id === 'descripcion'
                        ? 'Descripción'
                        : 'Creado',
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
          class="ml-auto"
          aria-label="Columns select dropdown"
        />
      </UDropdownMenu>
      <EstacionProduccionNewEstacionProduccion @creado="refresh()" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="estacionesProduccion"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ estacionesProduccion.length }} estaciones
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar estaciones de producción: {{ error.message }}
    </div>
  </div>
</template>
