<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateMovimientoInventario from "~/graphql/metodos-valoracion/create-metodos-valoracion.graphql";

const open = ref(false);

interface MovimientoInventarioFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const MovimientoInventarioSchemaInitialState: MovimientoInventarioFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
};

const state = reactive({ ...MovimientoInventarioSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, MovimientoInventarioSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateMovimientoInventario);

async function onSubmit(event: FormSubmitEvent<MovimientoInventarioFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "movimiento Inventario creado",
      description: "El movimiento Inventario fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear movimiento Inventario">
    <template #description>
      Completa el formulario para registrar un nuevo movimiento Inventario.
    </template>

    <UButton
      label="Nueva linea"
      color="neutral"
      variant="subtle"
      @click="open = true"
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
            placeholder="Código del movimiento Inventario"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del movimiento Inventario"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción del movimiento Inventario"
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
        label="Crear movimiento Inventario"
        type="submit"
        color="neutral"
        form="tipoCostoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
