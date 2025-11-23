<script setup lang="ts">
import NewMaquinas from "@/components/maquinas/NewMaquinas.vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import { computed, h, ref, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const GetMaquinas = gql`
  query GetMaquinas {
    maquinas {
      id
      codigo
      nombre
      descripcion
      numeroSerie
      fechaCompra
      costoCompra
      valorRescate
      vidaUtilAnios
      creadoEn
      actualizadoEn
    }
  }
`;

interface Maquina {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  numeroSerie?: string;
  fechaCompra: string;
  costoCompra: number;
  valorRescate?: number;
  vidaUtilAnios: number;
  creadoEn: string;
  actualizadoEn: string;
}

interface MaquinaResult {
  maquinas: Maquina[];
}

const { data, pending, error, refresh } =
  await useAsyncQuery<MaquinaResult>(GetMaquinas);

const maquinas = computed(() => data.value?.maquinas || []);

const columns: TableColumn<Maquina>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<Maquina> }) =>
      h("span", { class: "font-mono" }, row.original.codigo),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "numeroSerie",
    header: "N° Serie",
    cell: ({ row }) => row.original.numeroSerie || "-",
  },
  {
    accessorKey: "fechaCompra",
    header: "Fecha Compra",
    cell: ({ row }) => new Date(row.original.fechaCompra).toLocaleDateString(),
  },
  {
    accessorKey: "costoCompra",
    header: "Costo",
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-mono" },
        `$${row.original.costoCompra.toLocaleString()}`,
      ),
  },
  {
    accessorKey: "vidaUtilAnios",
    header: "Vida Útil",
    cell: ({ row }) => `${row.original.vidaUtilAnios} años`,
  },
  {
    id: "actions",
    header: "Acciones",
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
              "aria-label": "Acciones",
            }),
        ),
      ),
  },
];

function getRowItems(maquina: Maquina) {
  return [
    [
      {
        label: "Ver Depreciación",
        icon: "i-heroicons-eye-20-solid",
        onSelect: () => navigateTo(`/maquinas/${maquina.id}`),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Máquinas</h1>
    </div>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar máquinas..."
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
      <NewMaquinas @creada="refresh()" />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="maquinas"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
