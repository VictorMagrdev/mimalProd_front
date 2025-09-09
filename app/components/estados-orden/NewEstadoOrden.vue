<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateEstadoOrden from "~/graphql/estados-orden/create-estado-orden.graphql";

const open = ref(false);

interface EstadoOrdenFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

const EstadoOrdenSchemaInitialState: EstadoOrdenFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  activo: true,
};

const state = reactive({ ...EstadoOrdenSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, EstadoOrdenSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateEstadoOrden);

async function onSubmit(event: FormSubmitEvent<EstadoOrdenFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Estado de orden creado",
      description: "El estado de orden fue registrado correctamente",
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (e: unknown) {
    const message =
      typeof e === "object" && e !== null && "message" in e
        ? (e as { message: string }).message
        : String(e);
    error.value = message;
    toast.add({
      title: "Error",
      description: message,
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear estado de orden">
    <template #description>
      Completa el formulario para registrar un nuevo estado de orden.
    </template>

    <UButton
      class="right-0"
      label="Nuevo estado"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="estadoOrdenForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código del estado"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del estado"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción del estado"
          />
        </UFormField>

        <UFormField label="Activo" name="activo">
          <UCheckbox v-model="state.activo" class="w-full" />
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
        label="Crear estado"
        type="submit"
        color="neutral"
        form="estadoOrdenForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
