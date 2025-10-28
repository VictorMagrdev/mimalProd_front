<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import NewTiposIncidencias from "@/components/tipos-incidencias/NewTiposIncidencias.vue";
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

// Consulta GraphQL para obtener tipos de incidencia
const GetTiposIncidencia = gql`
  query GetTiposIncidencia {
    tiposIncidencia {
      id
      codigo
      nombre
      descripcion
      prioridadBase
    }
  }
`;

interface TipoIncidencia {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  prioridadBase: string;
}

interface TipoIncidenciaResult {
  tiposIncidencia: TipoIncidencia[];
}

const { data, pending, error, refresh } = await useAsyncQuery<TipoIncidenciaResult>(GetTiposIncidencia);

const tiposIncidencia = computed(() => data.value?.tiposIncidencia || []);

const columns: TableColumn<TipoIncidencia>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<TipoIncidencia> }) => 
      h("span", { class: "font-mono" }, row.original.codigo),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "prioridadBase",
    header: "Prioridad Base",
    cell: ({ row }) => {
      const color = {
        'LEVE': 'green',
        'MEDIA': 'yellow', 
        'ALTA': 'red'
      }[row.original.prioridadBase];
      
      return h(UBadge, { 
        class: "capitalize", 
        variant: "subtle", 
        color 
      }, () => row.original.prioridadBase.toLowerCase());
    }
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => row.original.descripcion || "-",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: () =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              "aria-label": "Acciones",
            }),
        ),
      ),
  },
];





const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Tipos de Incidencia</h1>
      <NewTiposIncidencias @creado="refresh()" />
    </div>

    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar tipos..."
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
      :data="tiposIncidencia"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>