<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h, ref, resolveComponent } from "vue";
import NewEstructuraProducto from "~/components/estructura-producto/NewEstructuraProducto.vue";
import type { Estructura } from "~/utils/types";

const UBadge = resolveComponent("UBadge");
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");

interface QueryResult {
  getAllEstructuras: Estructura[];
}

const query = gql`
  query estructurasProductos {
    estructurasProductos {
      id
      productoPadreNombre
      productoHijoNombre
      cantidad
      unidadNombre
      version
      activo
      creadoEn
    }
  }
`;

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);
const estructuras = computed(() => data.value?.getAllEstructuras ?? []);

const columns: TableColumn<Estructura>[] = [
  { accessorKey: "productoPadreNombre", header: "Padre" },
  { accessorKey: "productoHijoNombre", header: "Hijo" },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm font-mono" },
        row.original.cantidad.toString(),
      ),
  },
  {
    accessorKey: "unidadNombre",
    header: "Unidad",
    cell: ({ row }) =>
      row.original.unidadNombre ||
      h("span", { class: "italic text-muted" }, "N/A"),
  },
  {
    accessorKey: "version",
    header: "Versión",
    cell: ({ row }) =>
      row.original.version || h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "activo",
    header: "Activo",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: row.original.activo ? "success" : "neutral",
        },
        () => (row.original.activo ? "Sí" : "No"),
      ),
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.creadoEn).toLocaleDateString("es-ES"),
      ),
  },
];
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1 class="text-2xl font-bold">Estructuras de Producto</h1>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar estructuras..."
      />
      <div class="flex items-center space-x-2">
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: column.columnDef.header,
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
        <NewEstructuraProducto @creado="refresh()" />
      </div>
    </div>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="estructuras"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ estructuras.length }} estructuras
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar estructuras: {{ error.message }}
    </div>
  </div>
</template>
