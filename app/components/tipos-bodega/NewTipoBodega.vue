<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateTipoBodega from "~/graphql/tipos-costo/create-tipo-costo.graphql";

const open = ref(false);

interface TipoBodegaFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const TipoBodegaSchemaInitialState: TipoBodegaFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
};

const state = reactive({ ...TipoBodegaSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, TipoBodegaSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateTipoBodega);

async function onSubmit(event: FormSubmitEvent<TipoBodegaFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Tipo de costo creado",
      description: "El tipo de costo fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear tipo de costo">
    <template #description>
      Completa el formulario para registrar un nuevo tipo de costo.
    </template>

    <UButton
      class="right-0"
      label="Nuevo tipo de costo"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="TipoBodegaForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código del tipo de costo"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del tipo de costo"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción del tipo de costo"
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
        label="Crear tipo de costo"
        type="submit"
        color="neutral"
        form="TipoBodegaForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
