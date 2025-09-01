<script setup lang="ts">
import { ref, h, resolveComponent, useTemplateRef } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { upperFirst } from "scule";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const { data: roles, pending, error } = useAsyncData<RoleUI[]>("roles", () =>
  $fetch("http://localhost:8080/api/roles")
);


export interface RoleUI {
  id: number;
  name: string;
  description?: string;
}

const columns: TableColumn<RoleUI>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => row.getValue("description") || "-",
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            })
        )
      ),
  },
];

function getRowItems(row: Row<RoleUI>) {
  return [
    { type: "label", label: "Acciones" },
    {
      label: "detalles",
      onSelect() {
        console.log("Detalles rol", row.original.id);
      },
    },
    {
      label: "actualizar",
      onSelect() {
        console.log("Actualizar rol", row.original.id);
      },
    },
    {
      label: "borrar",
      onSelect() {
        console.log("Borrar rol", row.original.id);
      },
    },
  ];
}

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

const globalFilter = ref<string | undefined>();
const table = useTemplateRef("table");
const columnVisibility = ref({
  id: false,
});
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Vista de roles</h1>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />

      <div class="flex items-center space-x-2">
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => ({
                label: upperFirst(column.id),
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
            label="columnas"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>

        <NewRole />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility"
        :data="roles || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10">
        <UPagination
          :default-page="pagination.pageIndex + 1"
          :items-per-page="pagination.pageSize"
          :total="roles?.length || 0"
          @update:page="(p: number) => (pagination.pageIndex = p - 1)"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
