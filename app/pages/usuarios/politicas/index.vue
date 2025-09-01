<script setup lang="ts">
import { ref, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import PolicyForm from "~/components/PolicyForm.vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Data Fetching
const { data: policies, pending, error, refresh } = useAsyncData<PolicyUI[]>("policies", () =>
  $fetch("http://localhost:8080/api/policies")
);

export interface PolicyUI {
  id: number;
  role: { id: number; name: string };
  tag: { id: number; name: string };
  permission: { id: number; name: string };
}

// Modal and Form State
const isModalOpen = ref(false);
const toast = useToast();

// This is the type that can be emitted by the form
type PolicyFormData = { roleId: number | null; tagId: number | null; permissionId: number | null };

async function savePolicy(policyData: PolicyFormData) {
  // The form has its own validation, but we add a safeguard here to satisfy TS and prevent edge cases.
  if (!policyData.roleId || !policyData.tagId || !policyData.permissionId) {
    toast.add({
      title: "Error de validación",
      description: "Todos los campos son obligatorios.",
      color: "error",
    });
    return;
  }

  try {
    // At this point, TS knows the values are not null.
    await $fetch("http://localhost:8080/api/policies", {
      method: "POST",
      body: policyData,
    });

    toast.add({ title: "Política creada", color: "success" });
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

async function deletePolicy(policy: PolicyUI) {
  if (!confirm(`¿Estás seguro de que quieres eliminar la política con ID ${policy.id}?`)) {
    return;
  }

  try {
    await $fetch(`http://localhost:8080/api/policies/${policy.id}`, {
      method: "DELETE",
    });
    toast.add({ title: "Política eliminada", color: "success" });
    await refresh();
  } catch (err) {
    toast.add({
      title: "Error",
      description: (err instanceof Error ? err.message : String(err)) || "No se pudo guardar la política.",
      color: "error",
    });
  }
}

const columns: TableColumn<PolicyUI>[] = [
  {
    accessorKey: "role.name",
    header: "Rol",
    cell: (info) => info.row.original.role.name,
  },
  {
    accessorKey: "tag.name",
    header: "Tag",
    cell: (info) => info.row.original.tag.name,
  },
  {
    accessorKey: "permission.name",
    header: "Permiso",
    cell: (info) => info.row.original.permission.name,
  },
  {
    id: "actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(resolveComponent("UDropdown"), {
          items: getRowItems(row.original),
        })
      ),
  },
];

function getRowItems(policy: PolicyUI) {
  return [
    [
      {
        label: "Detalles",
        icon: "i-heroicons-eye-20-solid",
        click: () => router.push(`/usuarios/politicas/${policy.id}`),
      },
      {
        label: "Eliminar",
        icon: "i-heroicons-trash-20-solid",
        click: () => deletePolicy(policy),
      },
    ],
  ];
}

// Pagination and Filtering
const pagination = ref({
  pageIndex: 1,
  pageSize: 10,
});
const globalFilter = ref<string | undefined>();
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
      <h1>Vista de Políticas</h1>
      <UButton label="Nueva Política" @click="isModalOpen = true" />
    </div>

    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
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

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold">Crear Política</h2>
        </template>

        <PolicyForm @save="savePolicy" />

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton variant="ghost" @click="isModalOpen = false">
              Cancelar
            </UButton>
            <UButton type="submit" form="policy-form">
              Guardar
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
