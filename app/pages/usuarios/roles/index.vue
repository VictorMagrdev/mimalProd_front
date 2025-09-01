<script setup lang="ts">
import { ref, h, computed } from "vue";
import type { TableColumn } from "@nuxt/ui";
import RoleForm from "~/components/RoleForm.vue";

// Data Fetching
const { data: roles, pending, error, refresh } = useAsyncData<RoleUI[]>("roles", () =>
  $fetch("http://localhost:8080/api/roles")
);

export interface RoleUI {
  id: number;
  name: string;
  description?: string;
}

const isModalOpen = ref(false);
const selectedRole = ref<RoleUI | null>(null);
const toast = useToast();

const modalTitle = computed(() =>
  selectedRole.value ? "Editar Rol" : "Crear Rol"
);

function openModal(role: RoleUI | null = null) {
  selectedRole.value = role;
  isModalOpen.value = true;
}

async function saveRole(roleData: { name: string; description?: string }) {
  const isEditing = !!selectedRole.value;
  const method = isEditing ? "PUT" : "POST";
  const url = isEditing
    ? `http://localhost:8080/api/roles/${selectedRole.value!.id}`
    : "http://localhost:8080/api/roles";

  try {
    await $fetch(url, {
      method,
      body: roleData,
    });

    toast.add({
      title: isEditing ? "Rol actualizado" : "Rol creado",
      color: "success",
    });

    isModalOpen.value = false;
    await refresh();
  } catch (err) {
    toast.add({
      title: "Error",
      description: (err instanceof Error ? err.message : String(err)) || "No se pudo guardar la política.",
      color: "error",
    });
  }
}

async function deleteRole(role: RoleUI) {
  if (!confirm(`¿Estás seguro de que quieres eliminar el rol "${role.name}"?`)) {
    return;
  }

  try {
    await $fetch(`http://localhost:8080/api/roles/${role.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Rol eliminado", color: "success" });
    await refresh();
  } catch (err) {
    toast.add({
      title: "Error",
      description: (err instanceof Error ? err.message : String(err)) || "No se pudo guardar la política.",
      color: "error",
    });
  }
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
          resolveComponent("UDropdown"),
          {
            items: getRowItems(row.original),
          },
        )
      ),
  },
];

function getRowItems(role: RoleUI) {
  return [
    [
      {
        label: "Editar",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => openModal(role),
      },
      {
        label: "Eliminar",
        icon: "i-heroicons-trash-20-solid",
        click: () => deleteRole(role),
      },
    ],
  ];
}

const pagination = ref({
  pageIndex: 1,
  pageSize: 10,
});
const globalFilter = ref<string | undefined>();

</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
        <h1>Vista de roles</h1>
        <UButton label="Nuevo Rol" @click="openModal(null)" />
    </div>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />
    </div>

    <div class="relative z-0 w-full">
      <UTable
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :data="roles || []"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 w-full bg-white z-10 mt-4">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="roles?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold">{{ modalTitle }}</h2>
        </template>

        <RoleForm :role="selectedRole" @save="saveRole" />

        <template #footer>
            <div class="flex justify-end space-x-2">
                <UButton variant="ghost" @click="isModalOpen = false">
                    Cancelar
                </UButton>
                <UButton type="submit" form="role-form">
                    Guardar
                </UButton>
            </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>