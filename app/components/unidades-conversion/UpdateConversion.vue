<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import { useQuery } from "#imports";
import GetUnidadConversionById from "~/graphql/unidades-conversion/get-unidad-conversion-by-id.graphql";
import UpdateUnidadConversion from "~/graphql/unidades-conversion/update-unidad-conversion.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const props = defineProps<{ isOpen: boolean; conversionId: string | null }>();
const emit = defineEmits(["close", "updated"]);

interface UnidadConversionUpdateState {
  idOrigen?: string;
  idDestino?: string;
  factor: number;
}

const state = reactive<UnidadConversionUpdateState>({
  idOrigen: undefined,
  idDestino: undefined,
  factor: 1,
});

// Interfaces de entidades
interface UnidadMedida {
  id: string;
  nombre: string;
}

interface UnidadConversion {
  id: string;
  factor: number;
  origen?: UnidadMedida | null;
  destino?: UnidadMedida | null;
}

// Estado del formulario
interface UnidadConversionUpdateState {
  idOrigen?: string;
  idDestino?: string;
  factor: number;
}

// Resultados de queries
interface UnidadConversionResult {
  unidadConversion: UnidadConversion;
}

interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

const { result, loading: queryLoading } = useQuery<UnidadConversionResult>(
  GetUnidadConversionById,
  { id: computed(() => props.conversionId) },
  { enabled: computed(() => !!props.conversionId) },
);
watch(result, (newVal) => {
  if (newVal?.unidadConversion) {
    const { factor, origen, destino } = newVal.unidadConversion;
    Object.assign(state, {
      factor,
      idOrigen: origen?.id,
      idDestino: destino?.id,
    });
  }
});
const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery<UnidadesMedidaResult>(GetUnidadesMedida);

const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      label: u.nombre,
      value: u.id,
    })) ?? [],
);

const { mutate, loading: mutationLoading } = useMutation(
  UpdateUnidadConversion,
);

const toast = useToast();

function closeModal() {
  emit("close");
}

async function onSubmit() {
  if (!props.conversionId) return;
  try {
    await mutate({ id: props.conversionId, input: state });
    toast.add({ title: "Éxito", description: "Conversión actualizada." });
    emit("updated");
    closeModal();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    toast.add({ title: "Error", description: message });
  }
}
</script>

<template>
  <UModal :model-value="props.isOpen" @update:model-value="closeModal">
    <UCard>
      <template #header>
        <h2>Actualizar Conversión de Unidad</h2>
      </template>

      <div v-if="queryLoading">Cargando...</div>

      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Unidad Origen" name="idOrigen">
          <USelectMenu
            v-model="state.idOrigen"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
          />
        </UFormField>

        <UFormField label="Unidad Destino" name="idDestino">
          <USelectMenu
            v-model="state.idDestino"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
          />
        </UFormField>

        <UFormField label="Factor" name="factor">
          <UInput v-model.number="state.factor" type="number" />
        </UFormField>

        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
