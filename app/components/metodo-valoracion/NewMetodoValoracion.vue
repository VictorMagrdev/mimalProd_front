<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateMetodoValoracion from "~/graphql/metodos-valoracion/create-metodos-valoracion.graphql";

const emit = defineEmits<{ (e: "create"): void }>();
const open = ref(false);

interface MetodoValoracionFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const MetodoValoracionSchemaInitialState: MetodoValoracionFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
};

const state = reactive({ ...MetodoValoracionSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, MetodoValoracionSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateMetodoValoracion);

async function onSubmit(event: FormSubmitEvent<MetodoValoracionFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "metodo de valoracion creado",
      description: "El metodo de valoracion fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear metodo de valoracion">
    <template #description>
      Completa el formulario para registrar un nuevo metodo de valoracion.
    </template>

    <UButton
      class="right-0"
      label="Nuevo metodo de valoracion"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="tipoCostoForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código del metodo de valoracion"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del metodo de valoracion"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción del metodo de valoracion"
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
        label="Crear metodo de valoracion"
        type="submit"
        color="neutral"
        form="tipoCostoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
