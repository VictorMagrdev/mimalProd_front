<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";

const open = ref(false);

const UserSchemaInitialState = {
  username: "",
  email: "",
  password: "",
  active: true,
};

const state = reactive({ ...UserSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, UserSchemaInitialState);
}

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<typeof UserSchemaInitialState>) {
  error.value = null;

  const { data, error: fetchError } = await useFetch("http://localhost:8080/api/users", {
    method: "POST",
    body: event.data,
  });

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
    title: "Usuario creado",
    description: `El usuario ${data.value} fue registrado correctamente`,
    color: "success",
  });

  resetForm();
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" title="Crear usuario">
    <template #description>
      Completa el formulario para registrar un nuevo usuario.
    </template>

    <UButton class="right-0" label="Nuevo usuario" color="neutral" variant="subtle" />

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="formId"
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
            placeholder="********"
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
      <UButton label="Crear usuario" type="submit" color="neutral" form="formId" />
    </template>
  </UModal>
</template>
