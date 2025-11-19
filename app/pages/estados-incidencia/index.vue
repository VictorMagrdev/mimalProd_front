<script setup lang="ts">
import NewEstadosIncidencia from "@/components/estados-incidencia/NewEstadosIncidencia.vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import { computed, h, ref, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const GetEstadosIncidencia = gql`
  query GetEstadosIncidencia {
    estadosIncidencia {
      id
      nombre
      descripcion
      orden
      estadoFinal
    }
  }
`;

interface EstadoIncidencia {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  estadoFinal: boolean;
}

interface EstadoIncidenciaResult {
  estadosIncidencia: EstadoIncidencia[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<EstadoIncidenciaResult>(GetEstadosIncidencia);

const estadosIncidencia = computed(() => data.value?.estadosIncidencia || []);

const columns: TableColumn<EstadoIncidencia>[] = [
  {
    accessorKey: "orden",
    header: "Orden",
    cell: ({ row }: { row: Row<EstadoIncidencia> }) =>
      h("span", { class: "font-mono" }, `#${row.original.orden}`),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "estadoFinal",
    header: "Estado Final",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: row.original.estadoFinal ? "green" : "gray",
          variant: "subtle",
        },
        () => (row.original.estadoFinal ? "Sí" : "No"),
      ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion || "-",
  },
];

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Estados de Incidencia</h1>
      <NewEstadosIncidencia @creado="refresh()" />
    </div>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar estados..."
      />

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
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="estadosIncidencia"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
