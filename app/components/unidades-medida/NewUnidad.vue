<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed, watch } from "vue";
import CreateUnidadMedida from "~/graphql/unidades-medida/create-unidad-medida.graphql";
import GetUnidadesMedidaTipo from "~/graphql/unidades-medida-tipo/get-unidades-medida-tipo.graphql";

const open = ref(false);
const emit = defineEmits<{ (e: "create"): void }>();

interface UnidadMedidaFormState {
  codigo: string;
  nombre: string;
  abreviatura: string;
  idTipo?: string;
  esActiva: boolean;
  esBase: boolean;
}

const UnidadSchemaInitialState: UnidadMedidaFormState = {
  codigo: "",
  nombre: "",
  abreviatura: "",
  idTipo: undefined,
  esActiva: true,
  esBase: false,
};

const state = reactive({ ...UnidadSchemaInitialState });
const error = ref<string | null>(null);

// Interfaces de entidades
interface UnidadMedidaTipo {
  id: string;
  nombre: string;
}

// Estado del formulario
interface UnidadMedidaFormState {
  codigo: string;
  nombre: string;
  abreviatura: string;
  idTipo?: string;
  esActiva: boolean;
  esBase: boolean;
}

interface UnidadesMedidaTipoResult {
  unidadesMedidaTipo: UnidadMedidaTipo[];
}

const {
  result: tiposResult,
  loading: tiposLoading,
  refetch: refetchTipos,
} = useQuery<UnidadesMedidaTipoResult>(GetUnidadesMedidaTipo);

const tiposOptions = computed(
  () =>
    tiposResult.value?.unidadesMedidaTipo.map((t: UnidadMedidaTipo) => ({
      label: t.nombre,
      value: t.id,
    })) ?? [],
);

watch(open, (isOpen) => {
  if (isOpen) {
    refetchTipos();
  }
});

function resetForm() {
  Object.assign(state, UnidadSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateUnidadMedida);

async function onSubmit(event: FormSubmitEvent<UnidadMedidaFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Unidad de medida creada",
      description: "La unidad de medida fue registrada correctamente",
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    toast.add({ title: "Error", description: message });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear unidad de medida">
    <template #description>
      Completa el formulario para registrar una nueva unidad de medida.
    </template>

    <UButton
      class="right-0"
      label="Nueva unidad"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="unidadForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código de la unidad"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre de la unidad"
          />
        </UFormField>

        <UFormField label="Abreviatura" name="abreviatura">
          <UInput
            v-model="state.abreviatura"
            class="w-full"
            placeholder="Abreviatura de la unidad"
          />
        </UFormField>

        <UFormField label="Tipo" name="idTipo">
          <UInputMenu
            v-model="state.idTipo"
            :items="tiposOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione un tipo"
            :loading="tiposLoading"
          />
        </UFormField>

        <UFormField label="Activa" name="esActiva">
          <UCheckbox v-model="state.esActiva" class="w-full" />
        </UFormField>

        <UFormField label="Es Base" name="esBase">
          <UCheckbox v-model="state.esBase" class="w-full" />
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
        label="Crear unidad"
        type="submit"
        color="neutral"
        form="unidadForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
