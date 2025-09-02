<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const open = ref(true);
const error = ref<string | null>(null);

interface UserUpdateState {
  username: string;
  email: string;
  password?: string;
  active: boolean;
}

const state = reactive<UserUpdateState>({
  username: "",
  email: "",
  password: "",
  active: true,
});

const toast = useToast();

const userId = Number(route.params.id);

onMounted(async () => {
  const { data, error: fetchError } = await useFetch<UserUpdateState>(
    `http://localhost:8080/api/users/${userId}`,
    {
      headers: { Authorization: `Bearer ${auth.token}` },
    },
  );

  if (fetchError.value) {
    error.value = fetchError.value.message;
    return;
  }

  Object.assign(state, data.value);
});

function resetForm() {
  state.username = "";
  state.email = "";
  state.password = "";
  state.active = true;
}

// Actualizar usuario
async function onSubmit(event: FormSubmitEvent<UserUpdateState>) {
  error.value = null;

  const { error: fetchError } = await useFetch(
    `http://localhost:8080/api/users/${userId}`,
    {
      method: "PUT",
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
    title: "Usuario actualizado",
    description: `El usuario ${state.username} fue actualizado correctamente`,
    color: "success",
  });

  router.push("/usuarios");
}

async function deactivateUser() {
  const { error: fetchError } = await useFetch(
    `http://localhost:8080/api/users/${userId}/deactivate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
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

  toast.add({
    title: "Usuario desactivado",
    description: `El usuario ${state.username} fue desactivado`,
    color: "success",
  });

  router.push("/usuarios");
}
</script>

<template>
  <UModal v-model:open="open" title="Actualizar usuario">
    <template #description>
      Modifica los campos para actualizar la información del usuario.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="updateUserForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Usuario" name="username">
          <UInput
            v-model="state.username"
            class="w-full"
            placeholder="Nombre de usuario"
          />
        </UFormField>

        <UFormField label="Correo" name="email">
          <UInput
            v-model="state.email"
            class="w-full"
            type="email"
            placeholder="correo@ejemplo.com"
          />
        </UFormField>

        <UFormField label="Contraseña" name="password">
          <UInput
            v-model="state.password"
            class="w-full"
            type="password"
            placeholder="Dejar vacío para no cambiar"
          />
        </UFormField>

        <UFormField label="Activo" name="active">
          <UCheckbox v-model="state.active" class="w-full" />
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
        label="Actualizar"
        type="submit"
        color="neutral"
        form="updateUserForm"
      />
      <UButton
        label="Desactivar usuario"
        color="error"
        variant="outline"
        @click="deactivateUser"
      />
    </template>
  </UModal>
</template>
