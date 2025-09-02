<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

interface Role {
  id: number;
  name: string;
}

const { userId } = defineProps<{ userId: number }>();

const auth = useAuthStore();
const open = ref(false);
const error = ref<string | null>(null);

const state = reactive({
  roleId: undefined as number | undefined,
});

function resetForm() {
  state.roleId = undefined;
}

const toast = useToast();
const roles = ref<Role[]>([]);

const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.name, id: r.id })),
);

onMounted(async () => {
  try {
    const rolesRes = await $fetch<Role[]>("http://localhost:8080/api/roles", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    roles.value = rolesRes || [];
  } catch (err) {
    toast.add({ title: "Error", description: String(err), color: "error" });
  }
});

async function onSubmit() {
  error.value = null;

  try {
    await $fetch(`http://localhost:8080/api/users/${userId}/roles`, {
      method: "POST",
      body: { roleId: state.roleId },
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    toast.add({
      title: "Rol asignado",
      description: "El rol fue asignado correctamente al usuario",
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (err) {
    toast.add({ title: "Error", description: String(err), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Asignar rol a usuario">
    <template #description>
      Selecciona un rol para asignar al usuario.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="assignRoleForm"
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
        label="Asignar rol"
        type="submit"
        color="neutral"
        form="assignRoleForm"
      />
    </template>
  </UModal>
</template>
