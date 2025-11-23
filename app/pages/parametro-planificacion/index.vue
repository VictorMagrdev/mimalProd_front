<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { computed, h, ref } from "vue";

export interface ParametroPlanificacion {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  leadTimeDias: number;
  loteMinimo: number;
  loteEconomico: number;
  politicaInventario: string;
  actualizadoEn: string;
}

interface QueryResult {
  parametrosClasificacion: ParametroPlanificacion[];
}

const query = gql`
  query parametrosClasificacion {
    parametrosClasificacion {
      id
      productoCodigo
      productoNombre
      leadTimeDias
      loteMinimo
      loteEconomico
      politicaInventario
      actualizadoEn
    }
  }
`;

const { data, pending, error, refresh } =
  await useAsyncQuery<QueryResult>(query);
const parametros = computed(() => data.value?.parametrosClasificacion || []);

const columns: TableColumn<ParametroPlanificacion>[] = [
  {
    accessorKey: "productoCodigo",
    header: "Código Producto",
    cell: ({ row }) =>
      h("div", { class: "font-mono text-sm" }, row.original.productoCodigo),
  },
  {
    accessorKey: "productoNombre",
    header: "Nombre Producto",
    cell: ({ row }) =>
      h("div", { class: "font-medium" }, row.original.productoNombre),
  },
  {
    accessorKey: "leadTimeDias",
    header: "Lead Time (días)",
    cell: ({ row }) => row.original.leadTimeDias ?? "-",
  },
  {
    accessorKey: "loteMinimo",
    header: "Lote mínimo",
    cell: ({ row }) => row.original.loteMinimo?.toFixed(2) ?? "-",
  },
  {
    accessorKey: "loteEconomico",
    header: "Lote económico",
    cell: ({ row }) => row.original.loteEconomico?.toFixed(2) ?? "-",
  },
  {
    accessorKey: "politicaInventario",
    header: "Política inventario",
    cell: ({ row }) => row.original.politicaInventario || "-",
  },
  {
    accessorKey: "actualizadoEn",
    header: "Actualizado",
    cell: ({ row }) =>
      new Date(row.original.actualizadoEn).toLocaleDateString("es-ES"),
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold pl-8 pt-4">Parámetros de Planificación</h1>
    </div>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar parámetros..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />
      <div class="flex items-center space-x-2">
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: column.id,
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi
                    ?.getColumn(column.id)
                    ?.toggleVisibility(checked);
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
        <ParametroPlanificacionNewParametroPlanificacion @creado="refresh()" />
      </div>
    </div>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="parametros"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ parametros.length }} parámetros
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar parámetros: {{ error.message }}
    </div>
  </div>
</template>
