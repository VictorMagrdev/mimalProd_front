<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";

const open = ref(false);
const emit = defineEmits<{ (e: "create"): void }>();
const auth = useAuthStore();

const RoleSchemaInitialState = {
  nombre: "",
  descripcion: "",
};

const state = reactive({ ...RoleSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, RoleSchemaInitialState);
}

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<typeof RoleSchemaInitialState>) {
  error.value = null;

  const { data, error: fetchError } = await useFetch(
    "https://obvolutive-angelica-nonnotably.ngrok-free.dev/api/roles",
    {
      method: "POST",
      body: event.data,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
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
    title: "Rol creado",
    description: `El rol ${data} fue registrado correctamente`,
    color: "success",
  });

  resetForm();
  open.value = false;
  emit("create");
}
</script>

<template>
  <UModal v-model:open="open" title="Crear rol">
    <template #description>
      Completa el formulario para registrar un nuevo rol.
    </template>

    <UButton
      class="right-0"
      label="Nuevo rol"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm id="roleForm" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del rol"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción del rol"
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
        label="Crear rol"
        type="submit"
        color="neutral"
        form="roleForm"
      />
    </template>
  </UModal>
</template>
