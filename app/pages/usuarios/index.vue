<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { h, ref, resolveComponent, computed } from "vue";
import { useRouter } from "vue-router";
const toast = useToast();
const auth = useAuthStore();
const router = useRouter();
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");
const selectedUserId = ref<number | null>(null);
const selectedUserForRole = ref<number | null>(null);
const selectedUserForDeleteRole = ref<number | null>(null);

interface RolResponse {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface UserUI {
  id: number;
  username: string;
  email: string;
  telefono?: string;
  codigoEmpleado?: string;
  nombre?: string;
  apellidos?: string;
  centroCostoId?: number;
  capacidadHorasDia?: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  roles: RolResponse[];
}

const {
  data: users,
  pending,
  error,
  refresh,
} = await useFetch<UserUI[]>("http://localhost:8080/api/users", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
  default: () => [],
});

const desactivar = async (id: number) => {
  try {
    const { error } = await useFetch(
      `http://localhost:8080/api/users/${id}/deactivate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (error) {
      throw new Error(String(error) || "Error al desactivar usuario");
    }

    toast.add({
      title: "Usuario desactivado",
      description: "El usuario ha sido desactivado correctamente",
      color: "success",
      duration: 3000,
    });

    refresh();
  } catch (err) {
    toast.add({
      title: "Error",
      description: String(err),
      color: "error",
      duration: 5000,
    });
  }
};

const getNombreCompleto = (user: UserUI) => {
  if (user.nombre && user.apellidos) {
    return `${user.nombre} ${user.apellidos}`;
  }
  return user.nombre || user.apellidos || "Sin nombre";
};
const parseDuration = (duration: string | number | undefined) => {
  if (!duration) return null;
  if (typeof duration === "number") return duration;
  if (typeof duration === "string") {
    const match = duration.match(/PT(\d+)H/);
    if (match) {
      return Number(match[1]);
    }

    const numericValue = Number(duration);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
  }

  return null;
};

const columns: TableColumn<UserUI>[] = [
  {
    accessorKey: "codigoEmpleado",
    header: "Código",
    cell: ({ row }: { row: Row<UserUI> }) =>
      row.original.codigoEmpleado
        ? h(
            "span",
            { class: "font-mono text-sm bg-gray-100 px-2 py-1 rounded" },
            row.original.codigoEmpleado,
          )
        : h("span", { class: "text-gray-400 italic" }, "Sin código"),
    meta: {
      class: {
        th: "w-24",
      },
    },
  },
  {
    accessorKey: "username",
    header: "Usuario",
    cell: ({ row }: { row: Row<UserUI> }) =>
      h("span", { class: "font-medium" }, row.original.username),
  },
  {
    id: "nombreCompleto",
    header: "Nombre Completo",
    cell: ({ row }: { row: Row<UserUI> }) =>
      h("span", { class: "text-gray-700" }, getNombreCompleto(row.original)),
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }: { row: Row<UserUI> }) =>
      h("span", { class: "text-gray-600" }, row.original.email),
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }: { row: Row<UserUI> }) =>
      row.original.telefono
        ? h("span", { class: "text-gray-600" }, row.original.telefono)
        : h("span", { class: "text-gray-400 italic" }, "Sin teléfono"),
  },
  {
    accessorKey: "capacidadHorasDia",
    header: "Capacidad",
    cell: ({ row }) => {
      const horas = parseDuration(row.original.capacidadHorasDia);
      return horas
        ? h("span", { class: "text-blue-600 font-medium" }, `${horas} hrs/día`)
        : h("span", { class: "text-gray-400 italic" }, "No definida");
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }: { row: Row<UserUI> }) =>
      h(
        UBadge,
        {
          color: row.original.activo ? "emerald" : "red",
          variant: "subtle",
          class: "capitalize text-xs",
        },
        () => (row.original.activo ? "Activo" : "Inactivo"),
      ),
    meta: {
      class: {
        th: "w-20 text-center",
        td: "text-center",
      },
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }: { row: Row<UserUI> }) => {
      const roles = row.original.roles;
      if (!roles || roles.length === 0) {
        return h("span", { class: "text-gray-400 italic" }, "Sin roles");
      }

      return h(
        "div",
        { class: "flex flex-wrap gap-1" },
        roles.map((rol) =>
          h(
            UBadge,
            {
              color: "blue",
              variant: "outline",
              class: "text-xs",
            },
            () => rol.nombre,
          ),
        ),
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    meta: {
      class: {
        th: "w-32",
        td: "text-center",
      },
    },
    cell: ({ row }: { row: Row<UserUI> }) =>
      h(
        "div",
        { class: "flex justify-center" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row.original),
            "aria-label": `Acciones para ${row.original.username}`,
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              size: "sm",
              "aria-label": "Menú de acciones",
            }),
        ),
      ),
  },
];

function getRowItems(user: UserUI) {
  return [
    [
      {
        label: "Ver Detalles",
        icon: "i-lucide-eye",
        onSelect: () => router.push(`/usuarios/${user.id}`),
      },
      {
        label: "Editar",
        icon: "i-lucide-edit",
        onSelect: () => {
          selectedUserId.value = user.id;
        },
      },
    ],
    [
      {
        label: "Asignar Rol",
        icon: "i-lucide-user-plus",
        onSelect: () => {
          selectedUserForRole.value = user.id;
        },
      },
      {
        label: "Quitar Rol",
        icon: "i-lucide-user-minus",
        onSelect: () => {
          selectedUserForDeleteRole.value = user.id;
        },
      },
    ],
    [
      {
        label: user.activo ? "Desactivar" : "Activar",
        icon: user.activo ? "i-lucide-toggle-left" : "i-lucide-toggle-right",
        color: user.activo ? "orange" : "emerald",
        onSelect: () => desactivar(user.id),
      },
    ],
  ];
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");

const currentPage = computed({
  get: () => pagination.value.pageIndex + 1,
  set: (page) => {
    pagination.value.pageIndex = page - 1;
  },
});
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 pl-8 pt-4">
        Gestión de Usuarios
      </h1>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Buscar por código, nombre, usuario..."
        />

        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            :loading="pending"
            aria-label="Refrescar datos"
            @click="refresh()"
          />

          <UserNewUser @user-created="refresh()" />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="users"
        :columns="columns"
        :loading="pending"
        class="w-full"
      />

      <div
        class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="text-sm text-gray-600">
          Mostrando {{ Math.min(pagination.pageSize, users.length) }} de
          {{ users.length }} usuarios
        </div>

        <UPagination
          v-model="currentPage"
          :page-count="pagination.pageSize"
          :total="users.length"
        />
      </div>
    </div>

    <!-- Modales -->
    <UserUpdateUser
      v-if="selectedUserId !== null"
      :user-id="selectedUserId"
      :open="true"
      @close="selectedUserId = null"
      @user-updated="refresh()"
    />

    <UserPutRoleUser
      v-if="selectedUserForRole !== null"
      :user-id="selectedUserForRole"
      :open="true"
      @close="selectedUserForRole = null"
      @role-updated="refresh()"
    />

    <UserDeleteRoleUser
      v-if="selectedUserForDeleteRole !== null"
      :user-id="selectedUserForDeleteRole"
      :open="true"
      @close="selectedUserForDeleteRole = null"
      @role-removed="refresh()"
    />

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2 text-red-800">
        <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
        <span class="font-medium">Error al cargar usuarios</span>
      </div>
      <p class="text-red-600 text-sm mt-1">{{ error }}</p>
      <UButton
        color="warning"
        variant="outline"
        size="sm"
        class="mt-2"
        @click="refresh()"
      >
        Reintentar
      </UButton>
    </div>
  </div>
</template>
