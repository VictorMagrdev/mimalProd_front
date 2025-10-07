<script setup lang="ts">
import { ref, h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface PolicyUI {
  id: number;
  rol: { id: number; nombre: string };
  tag: { id: number; nombre: string };
  permiso: { id: number; accion: string };
}
const auth = useAuthStore();
const {
  data: policies,
  pending,
  error,
} = await useFetch<PolicyUI[]>("http://localhost:8080/api/policies", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
  default: () => [],
});
const toast = useToast();

async function deletePolicy(policy: PolicyUI) {
  if (
    !confirm(
      `¿Estás seguro de que quieres eliminar la política con ID ${policy.id}?`,
    )
  )
    return;

  const { error: fetchError } = await useFetch(
    `http://localhost:8080/api/policies/${policy.id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    },
  );

  if (fetchError.value) {
    toast.add({
      title: "Error",
      description: fetchError.value.message,
      color: "error",
    });
    return;
  }

  toast.add({ title: "Política eliminada", color: "success" });
}

const columns: TableColumn<PolicyUI>[] = [
  {
    accessorKey: "role.name",
    header: "Rol",
    cell: ({ row }: { row: Row<PolicyUI> }) => row.original.rol.nombre,
  },
  {
    accessorKey: "tag.name",
    header: "Tag",
    cell: ({ row }) => row.original.tag.nombre,
  },
  {
    accessorKey: "permission.name",
    header: "Permiso",
    cell: ({ row }) => row.original.permiso.accion,
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(UDropdownMenu, { items: getRowItems(row.original) }, () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          }),
        ),
      ),
  },
];

function getRowItems(policy: PolicyUI) {
  return [
    [
      {
        label: "Eliminar",
        icon: "i-heroicons-trash-20-solid",
        onSelect: () => deletePolicy(policy),
      },
    ],
  ];
}
const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Vista de Políticas</h1>
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
        :data="policies || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="policies?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
