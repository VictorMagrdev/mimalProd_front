<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import NewRequerimientoMaterial from "~/components/requerimiento-material/NewRequerimientoMaterial.vue";

const UBadge = resolveComponent("UBadge");

export interface RequerimientoMaterial {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  ordenProduccionId?: string;
  ordenProduccionCodigo?: string;
  cantidadRequerida: number;
  cantidadDisponible: number;
  cantidadAPedir: number;
  fechaNecesidad?: string;
  creadoEn: string;
}

interface QueryResult {
  getAllRequerimientos: RequerimientoMaterial[];
}

const query = gql`
  query requerimientosMateriales {
    requerimientosMateriales {
      id
      productoCodigo
      productoNombre
      ordenProduccionNumero
      cantidadRequerida
      cantidadDisponible
      cantidadAPedir
      fechaNecesidad
      creadoEn
    }
  }
`;

const { data, pending, error } = await useAsyncQuery<QueryResult>(query);
const requerimientos = computed(() => data.value?.getAllRequerimientos || []);

const columns: TableColumn<RequerimientoMaterial>[] = [
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
    accessorKey: "ordenProduccionCodigo",
    header: "Orden Prod.",
    cell: ({ row }) =>
      row.original.ordenProduccionCodigo ||
      h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "cantidadRequerida",
    header: "Req.",
    cell: ({ row }) => row.original.cantidadRequerida.toFixed(2),
  },
  {
    accessorKey: "cantidadDisponible",
    header: "Disp.",
    cell: ({ row }) => row.original.cantidadDisponible.toFixed(2),
  },
  {
    accessorKey: "cantidadAPedir",
    header: "A Pedir",
    cell: ({ row }) =>
      h(UBadge, { color: "neutral", variant: "subtle" }, () =>
        row.original.cantidadAPedir.toFixed(2),
      ),
  },
  {
    accessorKey: "fechaNecesidad",
    header: "Necesidad",
    cell: ({ row }) =>
      row.original.fechaNecesidad
        ? new Date(row.original.fechaNecesidad).toLocaleDateString("es-ES")
        : h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }) =>
      new Date(row.original.creadoEn).toLocaleDateString("es-ES"),
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Requerimientos de Material</h1>
      <NewRequerimientoMaterial @creado="() => table?.tableApi?.reset()" />
    </div>

    <div
      class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar requerimientos..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="requerimientos"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ requerimientos.length }} requerimientos
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar requerimientos: {{ error.message }}
    </div>
  </div>
</template>
