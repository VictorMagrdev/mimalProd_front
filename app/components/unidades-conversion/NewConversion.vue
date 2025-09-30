<script setup lang="ts">
import { reactive, computed } from "vue";
import CreateUnidadConversion from "~/graphql/unidades-conversion/create-unidad-conversion.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const open = ref(false);
const emit = defineEmits<{ (e: "create"): void }>();

interface UnidadMedida {
  id: string;
  nombre: string;
}

// Interfaces de resultados de queries
interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

// Estado del formulario
interface UnidadConversionFormState {
  idOrigen?: string;
  idDestino?: string;
  factor: number;
}

const initialState: UnidadConversionFormState = {
  idOrigen: undefined,
  idDestino: undefined,
  factor: 1,
};

// Query tipada
const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery<UnidadesMedidaResult>(GetUnidadesMedida);

// Options tipados
const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      label: u.nombre,
      value: u.id,
    })) ?? [],
);
function resetForm() {
  Object.assign(state, initialState);
}
const { mutate, loading } = useMutation(CreateUnidadConversion);
const state = reactive({ ...initialState });

const toast = useToast();

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: "Éxito", description: "Conversión creada." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    toast.add({ title: "Error", description: message });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear conversion">
    <template #header>
      <h2>Crear Conversión de Unidad</h2>
    </template>

    <template #body>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Unidad Origen" name="idOrigen">
          <USelectMenu
            v-model="state.idOrigen"
            :items="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Unidad Destino" name="idDestino">
          <USelectMenu
            v-model="state.idDestino"
            :items="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Factor" name="factor">
          <UInput v-model.number="state.factor" type="number" class="w-full" />
        </UFormGroup>
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
        label="Crear conversion"
        type="submit"
        color="neutral"
        form="tipoCostoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
