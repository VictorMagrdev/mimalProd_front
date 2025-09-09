<script setup lang="ts">
import { reactive, computed } from "vue";
import CreateUnidadConversion from "~/graphql/unidades-conversion/create-unidad-conversion.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close", "created"]);

const initialState = { idOrigen: undefined, idDestino: undefined, factor: 1 };
const state = reactive({ ...initialState });

// Fetch unidades for select menus
const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery(GetUnidadesMedida);
const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u: any) => ({
      label: u.nombre,
      value: u.id,
    })) || [],
);

const { mutate, loading } = useMutation(CreateUnidadConversion);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit("close");
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: "Éxito", description: "Conversión creada." });
    emit("created");
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
      <template #header><h2>Crear Conversión de Unidad</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Unidad Origen" name="idOrigen">
          <USelectMenu
            v-model="state.idOrigen"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
          />
        </UFormGroup>
        <UFormGroup label="Unidad Destino" name="idDestino">
          <USelectMenu
            v-model="state.idDestino"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
          />
        </UFormGroup>
        <UFormGroup label="Factor" name="factor"
          ><UInput v-model.number="state.factor" type="number"
        /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
