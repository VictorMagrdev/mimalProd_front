<script setup lang="ts">
import { ref, computed, h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

export interface CostoOrden {
  id: string;
  orden_id: string;
  tipo_costo_id: string;
  descripcion: string;
  monto: number;
  moneda: string;
  registrado_en: string;
  tipo_costo: {
    nombre: string;
    codigo: string;
  };
  orden?: {
    numero_orden: string;
  };
}

interface QueryResult {
  costosOrden: CostoOrden[];
}

const query = gql`
  query costosOrden {
    costosOrden {
      id
      ordenId
      tipoCostoId
      descripcion
      monto
      moneda
      registrado_en
      tipo_costo {
        nombre
        codigo
      }
      orden {
        numeroOrden
      }
    }
  }
`;

const { data, pending, error } = await useAsyncQuery<QueryResult>(query);

const costosOrden = computed(() => data.value?.costosOrden || []);

const columns: TableColumn<CostoOrden>[] = [
  {
    accessorKey: "orden",
    header: "Orden",
    cell: ({ row }) =>
      row.original.orden
        ? h(
            "div",
            { class: "font-mono text-sm" },
            `#${row.original.orden.numero_orden}`,
          )
        : h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "tipo_costo",
    header: "Tipo Costo",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: "primary",
          class: "capitalize",
        },
        () => row.original.tipo_costo.nombre,
      ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) =>
      h("div", { class: "max-w-xs truncate" }, row.original.descripcion),
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right font-mono font-medium" },
        new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: row.original.moneda,
        }).format(row.original.monto),
      ),
  },
  {
    accessorKey: "moneda",
    header: "Moneda",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "outline",
          color: "neutral",
        },
        () => row.original.moneda,
      ),
  },
  {
    accessorKey: "registrado_en",
    header: "Registrado",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.registrado_en).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      ),
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

function getRowItems(costo: CostoOrden) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(costo.id),
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
      <h1 class="text-2xl font-bold">Costos de Orden</h1>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar costos..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label:
                column.id === 'orden'
                  ? 'Orden'
                  : column.id === 'tipo_costo'
                    ? 'Tipo Costo'
                    : column.id === 'descripcion'
                      ? 'Descripción'
                      : column.id === 'monto'
                        ? 'Monto'
                        : column.id === 'moneda'
                          ? 'Moneda'
                          : 'Registrado',
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
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="costosOrden"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ costosOrden.length }} costos
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar costos de orden: {{ error.message }}
    </div>
  </div>
</template>
