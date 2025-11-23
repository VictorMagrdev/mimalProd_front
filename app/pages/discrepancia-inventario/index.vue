<script setup lang="ts">
import { ref, computed, h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import type { DiscrepanciaInventario } from "~/utils/types";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

interface QueryResult {
  discrepanciasInventario: DiscrepanciaInventario[];
}

const query = gql`
  query discrepanciasInventario {
    discrepanciasInventario {
      id
      conteoId
      cantidadSistema
      resuelto
      conteo {
        fecha
        cantidadContada
        producto {
          nombre
          codigo
        }
        unidad {
          abreviatura
        }
      }
    }
  }
`;

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);

const discrepanciasInventario = computed(
  () => data.value?.discrepanciasInventario || [],
);

const columns: TableColumn<DiscrepanciaInventario>[] = [
  {
    accessorKey: "producto",
    header: "Producto",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      h("div", [
        h(
          "div",
          { class: "font-medium text-highlighted" },
          row.original.conteo.producto.nombre,
        ),
        h(
          "div",
          { class: "text-sm text-muted" },
          row.original.conteo.producto.codigo,
        ),
      ]),
  },
  {
    accessorKey: "cantidad_sistema",
    header: "Cant. Sistema",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      h("div", { class: "text-right font-mono" }, [
        h("span", row.original.cantidadSistema.toString()),
        row.original.conteo.unidad &&
          h(
            "span",
            { class: "text-sm text-muted ml-1" },
            row.original.conteo.unidad.abreviatura,
          ),
      ]),
  },
  {
    accessorKey: "conteo.cantidad_contada",
    header: "Cant. Contada",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      h("div", { class: "text-right font-mono" }, [
        h("span", row.original.conteo.cantidadContada.toString()),
        row.original.conteo.unidad &&
          h(
            "span",
            { class: "text-sm text-muted ml-1" },
            row.original.conteo.unidad.abreviatura,
          ),
      ]),
  },
  {
    id: "diferencia",
    header: "Diferencia",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) => {
      const diferencia =
        row.original.conteo.cantidadContada - row.original.cantidadSistema;
      const color =
        diferencia === 0 ? "neutral" : diferencia > 0 ? "success" : "error";

      return h(
        "div",
        { class: "text-right" },
        h(
          UBadge,
          {
            variant: "subtle",
            color,
            class: "font-mono",
          },
          () => `${diferencia > 0 ? "+" : ""}${diferencia}`,
        ),
      );
    },
  },
  {
    accessorKey: "resuelto",
    header: "Estado",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: row.original.resuelto ? "success" : "warning",
          class: "capitalize",
        },
        () => (row.original.resuelto ? "Resuelto" : "Pendiente"),
      ),
  },
  {
    accessorKey: "conteo.fecha",
    header: "Fecha Conteo",
    cell: ({ row }: { row: Row<DiscrepanciaInventario> }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.conteo.fecha).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      ),
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Discrepancias de Inventario</h1>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar discrepancias..."
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
                  : column.id === 'cantidad_sistema'
                    ? 'Cant. Sistema'
                    : column.id === 'conteo.cantidad_contada'
                      ? 'Cant. Contada'
                      : column.id === 'diferencia'
                        ? 'Diferencia'
                        : column.id === 'resuelto'
                          ? 'Estado'
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
      <DiscrepaciaInventarioNewDiscrepanciaInventario @creado="refresh()" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="discrepanciasInventario"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ discrepanciasInventario.length }} discrepancias
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar discrepancias de inventario: {{ error.message }}
    </div>
  </div>
</template>
