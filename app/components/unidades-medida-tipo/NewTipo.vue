<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive } from "vue";
import CreateUnidadMedidaTipo from "~/graphql/unidades-medida-tipo/create-unidad-medida-tipo.graphql";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close", "created"]);

interface UnidadMedidaTipoFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const initialState: UnidadMedidaTipoFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
};

const state = reactive({ ...initialState });

const { mutate, loading } = useMutation(CreateUnidadMedidaTipo);
const toast = useToast();

function resetForm() {
  Object.assign(state, initialState);
}

function closeModal() {
  resetForm();
  emit("close");
}

async function onSubmit(event: FormSubmitEvent<UnidadMedidaTipoFormState>) {
  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Éxito",
      description: "El tipo de unidad de medida fue creado correctamente.",
      color: "success",
    });

    emit("created");
    closeModal();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    toast.add({ title: "Error", description: message, color: "error" });
  }
}
</script>

<template>
  <UModal :model-value="props.isOpen" @update:model-value="closeModal">
    <template #header>
      <h2 class="text-lg font-semibold">Crear Tipo de Unidad de Medida</h2>
    </template>

    <UForm
      id="unidadMedidaTipoForm"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField label="Código" name="codigo">
        <UInput v-model="state.codigo" placeholder="Ej. KG" />
      </UFormField>

      <UFormField label="Nombre" name="nombre">
        <UInput v-model="state.nombre" placeholder="Ej. Kilogramos" />
      </UFormField>

      <UFormField label="Descripción" name="descripcion">
        <UInput
          v-model="state.descripcion"
          placeholder="Descripción opcional"
        />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        label="Cancelar"
        variant="outline"
        color="neutral"
        @click="closeModal"
      />
      <UButton
        label="Crear"
        type="submit"
        form="unidadMedidaTipoForm"
        :loading="loading"
        color="neutral"
      />
    </template>
  </UModal>
</template>
