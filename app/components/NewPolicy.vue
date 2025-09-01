<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

interface Role {
  id: number;
  name: string;
}
interface Tag {
  id: number;
  name: string;
}
interface Permission {
  id: number;
  action: string;
  description: string;
}

const auth = useAuthStore();
const open = ref(false);
const error = ref<string | null>(null);

const state = reactive({
  roleId: 0,
  tagId: 0,
  permissionId: 0,
});

function resetForm() {
  state.roleId = 0;
  state.tagId = 0;
  state.permissionId = 0;
}

const toast = useToast();

const roles = ref<Role[]>([]);
const tags = ref<Tag[]>([]);
const permissions = ref<Permission[]>([]);

const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.name, id: r.id })),
);
const tagOptions = computed(() =>
  tags.value.map((t) => ({ label: t.name, id: t.id })),
);
const permissionOptions = computed(() =>
  permissions.value.map((p) => ({ label: p.action, id: p.id })),
);

onMounted(async () => {
  const [rolesRes, tagsRes, permsRes] = await Promise.all([
    $fetch<Role[]>("http://localhost:8080/api/roles", {
      headers: { Authorization: `Bearer ${auth.token}` },
    }),
    $fetch<Tag[]>("http://localhost:8080/api/tags", {
      headers: { Authorization: `Bearer ${auth.token}` },
    }),
    $fetch<Permission[]>("http://localhost:8080/api/permissions", {
      headers: { Authorization: `Bearer ${auth.token}` },
    }),
  ]);

  roles.value = rolesRes || [];
  tags.value = tagsRes || [];
  permissions.value = permsRes || [];
});

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  error.value = null;

  const { error: fetchError } = await useFetch(
    "http://localhost:8080/api/policies",
    {
      method: "POST",
      body: event.data,
      headers: { Authorization: `Bearer ${auth.token}` },
    },
  );

  if (fetchError.value) {
    error.value = fetchError.value.message;
    toast.add({
      title: "Error",
      description: fetchError.value.message,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Política creada",
    description: "La política fue registrada correctamente",
    color: "success",
  });
  resetForm();
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" title="Crear política">
    <template #description>
      Completa el formulario para registrar una nueva política.
    </template>
    <UButton class="right-0" label="Crear" color="neutral" variant="subtle" />
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="policyForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Rol" name="roleId">
          <UInputMenu
            v-model="state.roleId"
            value-key="id"
            :items="roleOptions"
            class="w-full"
            placeholder="Selecciona un rol"
          />
        </UFormField>

        <UFormField label="Tag" name="tagId">
          <UInputMenu
            v-model="state.tagId"
            value-key="id"
            :items="tagOptions"
            class="w-full"
            placeholder="Selecciona un tag"
          />
        </UFormField>

        <UFormField label="Permiso" name="permissionId">
          <UInputMenu
            v-model="state.permissionId"
            value-key="id"
            :items="permissionOptions"
            class="w-full"
            placeholder="Selecciona un permiso"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            close();
            resetForm();
          }
        "
      />
      <UButton
        label="Crear política"
        type="submit"
        color="neutral"
        form="policyForm"
      />
    </template>
  </UModal>
</template>
