<script setup lang="ts">
import { ref, h, resolveComponent, onMounted } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { useRouter } from "vue-router";
import NewUser from "~/components/user/NewUser.vue";
const selectedUserId = ref<number | null>(null);
const selectedUserForRole = ref<number | null>(null);
const selectedUserForDeleteRole = ref<number | null>(null);
const router = useRouter();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const toast = useToast();
const auth = useAuthStore();

// Cambiar a reactive fetch
const users = ref<UserUI[]>([]);
const pending = ref(false);
const error = ref(null);

const fetchUsers = async () => {
  pending.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await useFetch<UserUI[]>(
      "http://localhost:8080/api/users",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    );

    if (fetchError.value) throw fetchError.value;
    users.value = data.value || [];
  } catch (err) {
    toast.add({
      title: "Error",
      description: String(err),
      color: "error",
    });
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchUsers();
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
      description: `El usuario fue desactivado`,
      color: "success",
    });

    // Actualizar la lista después de desactivar
    await fetchUsers();
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
            content: {
              align: "end",
            },
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
            }),
        ),
      );
    },
  },
];
function getRowItems(row: Row<UserUI>) {
  const userId = row.original.id;
  return [
    {
      type: "label",
      label: "Acciones",
    },
    {
      label: "Detalles",
      icon: "i-heroicons-eye-20-solid",
      onSelect: () => router.push(`/usuarios/${userId}`),
    },
    {
      label: "Actualizar",
      icon: "i-heroicons-pencil-square-20-solid",
      onSelect: () => {
        selectedUserId.value = Number(userId);
      },
    },
    {
      label: "Asignar Rol",
      icon: "i-heroicons-user-plus-20-solid",
      onSelect: () => {
        selectedUserForRole.value = Number(userId);
      },
    },
    {
      label: "Quitar Rol",
      icon: "i-heroicons-user-minus-20-solid",
      onSelect: () => {
        selectedUserForDeleteRole.value = Number(userId);
      },
    },
    {
      label: "Desactivar",
      icon: "i-heroicons-trash-20-solid",
      onSelect: () => desactivar(Number(userId)),
    },
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
          v-if="selectedUserId !== null"
          :user-id="selectedUserId"
          :open="true"
          @close="selectedUserId = null"
          @user-updated="fetchUsers"
        />

        <PutRoleUser
          v-if="selectedUserForRole !== null"
          :user-id="selectedUserForRole"
          :open="true"
          @close="selectedUserForRole = null"
          @role-updated="fetchUsers"
        />

        <DeleteRoleUser
          v-if="selectedUserForDeleteRole !== null"
          :user-id="selectedUserForDeleteRole"
          :open="true"
          @close="selectedUserForDeleteRole = null"
          @role-removed="fetchUsers"
        />

        <NewUser @user-created="fetchUsers" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="users"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="users.length"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error }}</div>
  </div>
</template>
