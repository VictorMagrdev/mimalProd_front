<script setup lang="ts">
import { ref, h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";

const router = useRouter();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

export interface RoleUI {
  id: number;
  name: string;
  description?: string;
}

const auth = useAuthStore();

const {
  data: roles,
  pending,
  error,
} = await useFetch<RoleUI[]>("http://localhost:8080/api/roles", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
  default: () => [],
});

const columns: TableColumn<RoleUI>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }: { row: Row<RoleUI> }) => {
      const desc = row.getValue("description") as string | undefined;
      return h("span", {}, desc ?? "-");
    },
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(UDropdownMenu, { items: getRowItems(row) }, () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          }),
        ),
      ),
  },
];

function getRowItems(row: Row<RoleUI>) {
  return [
    [
      {
        label: "Detalles",
        icon: "i-heroicons-eye-20-solid",
        click: () => router.push(`/usuarios/roles/${row.original.id}`),
      },
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => console.log("Actualizar rol", row.original.id),
      },
      {
        label: "Borrar",
        icon: "i-heroicons-trash-20-solid",
        click: () => console.log("Borrar rol", row.original.id),
      },
    ],
  ];
}

const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Vista de roles</h1>

    <div
      class="flex items-center justify-between border-b border-accented px-4 py-3.5"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />

      <div class="flex items-center space-x-2">
        <NewRole />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="roles || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 z-10 mt-4 w-full bg-white">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="roles?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
