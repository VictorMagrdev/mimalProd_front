<script setup lang="ts">
import { ref, h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";

const selectedUserId = ref<number | null>(null);
const showUpdateUserModal = ref(false);
const router = useRouter();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const toast = useToast();
const auth = useAuthStore();

const {
  data: users,
  pending,
  error,
} = await useFetch<UserUI[]>("http://localhost:8080/api/users", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
  default: () => [],
});

const desactivar = async (id: number) => {
  try {
    const { error: fetchError } = await useFetch(
      `http://localhost:8080/api/users/${id}/deactivate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
    if (fetchError.value) throw fetchError.value;
    toast.add({
      title: "Usuario desactivado",
      description: `El usuario  fue desactivado`,
      color: "success",
    });
  } catch (err) {
    toast.add({
      title: "Error",
      description: String(err),
      color: "error",
    });
  }
};

export interface UserUI {
  id: number;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
}

const columns: TableColumn<UserUI>[] = [
  {
    accessorKey: "username",
    header: "Usuario",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "active",
    header: "Activo",
    cell: ({ row }: { row: Row<UserUI> }) => {
      const activo = row.getValue("active");
      return h(
        "span",
        {
          class: activo
            ? "text-green-600 font-semibold"
            : "text-red-600 font-semibold",
        },
        activo ? "Sí" : "No",
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }: { row: Row<UserUI> }) => {
      const roles = row.getValue("roles") as string[];
      return h("span", { class: "text-gray-700" }, roles.join(", "));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
            }),
        ),
      );
    },
  },
];

function getRowItems(row: Row<UserUI>) {
  return [
    [
      {
        label: "Detalles",
        icon: "i-heroicons-eye-20-solid",
        click: () => router.push(`/usuarios/${row.original.id}`),
      },
      {
        label: "Actualizar",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => {
          selectedUserId.value = row.original.id;
          showUpdateUserModal.value = true;
        },
      },
      {
        label: "Borrar",
        icon: "i-heroicons-trash-20-solid",
        click: () => desactivar(row.original.id),
      },
    ],
  ];
}

const pagination = ref({
  pageIndex: 1,
  pageSize: 10,
});

const globalFilter = ref();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Vista de usuarios</h1>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />

      <div class="flex items-center space-x-2">
        <UpdateUser
          v-if="showUpdateUserModal"
          :key="selectedUserId ?? 0"
          :user-id="selectedUserId"
          @close="showUpdateUserModal = false"
        />

        <NewUser />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="users || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="users?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
