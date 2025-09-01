<script setup lang="ts">
import { ref, h, resolveComponent, useTemplateRef } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { upperFirst } from "scule";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const { data: policies, pending, error } = useAsyncData<PolicyUI[]>("roles", () =>
  $fetch("http://localhost:8080/api/policies")
);

export interface PolicyUI {
  id: number;
  role: { id: number; name: string };
  tag: { id: number; name: string };
  permission: { id: number; name: string };
}

const columns: TableColumn<PolicyUI>[] = [
  {
    accessorKey: "role.name",
    header: "Rol",
    cell: ({ row }) => row.getValue("role.name"),
  },
  {
    accessorKey: "tag.name",
    header: "Tag",
    cell: ({ row }) => row.getValue("tag.name"),
  },
  {
    accessorKey: "permission.name",
    header: "Permiso",
    cell: ({ row }) => row.getValue("permission.name"),
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

function getRowItems(row: Row<PolicyUI>) {
  return [
    { type: "label", label: "Acciones" },
    {
      label: "detalles",
      onSelect() {
        console.log("Detalles política", row.original.id);
      },
    },
    {
      label: "actualizar",
      onSelect() {
        console.log("Actualizar política", row.original.id);
      },
    },
    {
      label: "borrar",
      onSelect() {
        console.log("Borrar política", row.original.id);
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
    <h1>Vista de políticas</h1>

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

        <NewPolicy />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility"
        :data="policies || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10">
        <UPagination
          :default-page="pagination.pageIndex + 1"
          :items-per-page="pagination.pageSize"
          :total="policies?.length || 0"
          @update:page="(p: number) => (pagination.pageIndex = p - 1)"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
