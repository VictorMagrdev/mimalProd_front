<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h, ref, resolveComponent } from "vue";
import type { Bodega } from "~/utils/types";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

interface QueryResult {
  bodegas: Bodega[];
}

const query = gql`
  query bodegas {
    bodegas {
      id
      codigo
      nombre
      descripcion
      tipoBodegaId
      creadoEn
      tipo {
        nombre
      }
    }
  }
`;

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);

const bodegas = computed(() => data.value?.bodegas || []);

const columns: TableColumn<Bodega>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) =>
      h("div", { class: "font-mono text-sm" }, row.original.codigo),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) =>
      h("div", { class: "font-medium text-highlighted" }, row.original.nombre),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: "neutral",
          class: "capitalize",
        },
        () => row.original.tipo?.nombre || "Sin tipo",
      ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) =>
      row.original.descripcion ||
      h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.creadoEn).toLocaleDateString("es-ES"),
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
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
              class: "ml-auto",
              "aria-label": "Acciones",
            }),
        ),
      ),
  },
];

function getRowItems(bodega: Bodega) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(bodega.id),
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
      <h1 class="text-2xl font-bold">Bodegas</h1>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar bodegas..."
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
                    : column.id === 'tipo'
                      ? 'Tipo'
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
      <BodegaNewBodega @creado="refresh()" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="bodegas"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ bodegas.length }} bodegas
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar bodegas: {{ error.message }}
    </div>
  </div>
</template>
