<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h, ref, resolveComponent } from "vue";
import NewConteoCiclico from "~/components/conteo-ciclico/NewConteoCiclico.vue";
import type { ConteoCiclico, QueryResult } from "~/utils/types";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const query = gql`
  query conteosCiclicos {
    conteosCiclicos {
      id
      productoId
      bodegaId
      loteId
      cantidadContada
      unidadId
      fecha
      producto {
        nombre
        codigo
      }
      bodega {
        nombre
      }
      lote {
        numeroLote
      }
      unidad {
        nombre
        abreviatura
      }
    }
  }
`;

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);

const conteosCiclicos = computed(() => data.value?.conteosCiclicos || []);

const columns: TableColumn<ConteoCiclico>[] = [
  {
    accessorKey: "producto",
    header: "Producto",
    cell: ({ row }) =>
      h("div", [
        h(
          "div",
          { class: "font-medium text-highlighted" },
          row.original.producto?.nombre,
        ),
        h(
          "div",
          { class: "text-sm text-muted" },
          row.original.producto?.codigo,
        ),
      ]),
  },
  {
    accessorKey: "bodega",
    header: "Bodega",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: "neutral",
          class: "capitalize",
        },
        () => row.original.bodega?.nombre,
      ),
  },
  {
    accessorKey: "lote",
    header: "Lote",
    cell: ({ row }) =>
      row.original.lote?.numeroLote
        ? h(UBadge, { variant: "outline" }, () => row.original.lote?.numeroLote)
        : h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "cantidad_contada",
    header: "Cantidad",
    cell: ({ row }) =>
      h("div", { class: "text-right font-mono" }, [
        h("span", row.original.cantidadContada.toString()),
        h(
          "span",
          { class: "text-sm text-muted ml-1" },
          row.original.unidad?.abreviatura,
        ),
      ]),
  },
  {
    accessorKey: "fecha",
    header: "Fecha Conteo",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.fecha).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
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

function getRowItems(conteo: ConteoCiclico) {
  return [
    [
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-20-solid",
        onSelect: () => openUpdateModal(conteo.id),
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
      <h1 class="text-2xl font-bold pl-8 pt-4">Conteos Cíclicos</h1>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar conteos..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label:
                column.id === 'producto'
                  ? 'Producto'
                  : column.id === 'bodega'
                    ? 'Bodega'
                    : column.id === 'lote'
                      ? 'Lote'
                      : column.id === 'cantidad_contada'
                        ? 'Cantidad'
                        : 'Fecha',
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
      <NewConteoCiclico @creado="refresh()" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="conteosCiclicos"
      :columns="columns"
      :loading="pending"
      sticky
      class="flex-1 overflow-auto h-96"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ conteosCiclicos.length }} conteos
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar conteos cíclicos: {{ error.message }}
    </div>
  </div>
</template>
