<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateCostoOrden from '~/graphql/costos-orden/create-costo-orden.graphql';
import GetOrdenesProduccion from '~/graphql/ordenes-produccion/get-ordenes-produccion.graphql';
import GetTiposCosto from '~/graphql/tipos-costo/get-tipos-costo.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { idOrden: undefined, idTipoCosto: undefined, descripcion: '', monto: 0, moneda: 'USD' };
const state = reactive({ ...initialState });

const { data: ordenesResult, pending: ordenesLoading } = await useAsyncQuery(GetOrdenesProduccion);
const { data: tiposResult, pending: tiposLoading } = await useAsyncQuery(GetTiposCosto);

const ordenesOptions = computed(() => ordenesResult.value?.ordenesProduccion.map((o: any) => ({ label: o.numeroOrden, value: o.id })) || []);
const tiposOptions = computed(() => tiposResult.value?.tiposCosto.map((t: any) => ({ label: t.nombre, value: t.id })) || []);

const { mutate, loading } = useMutation(CreateCostoOrden);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Costo de orden creado.' });
    emit('created');
    closeModal();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    toast.add({ title: 'Error', description: message });
  }
}
</script>

<template>
  <UModal :model-value="props.isOpen" @update:model-value="closeModal">
    <UCard>
      <template #header><h2>Crear Costo de Orden</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Orden de Producción" name="idOrden"><USelectMenu v-model="state.idOrden" :options="ordenesOptions" value-attribute="value" option-attribute="label" :loading="ordenesLoading" /></UFormGroup>
        <UFormGroup label="Tipo de Costo" name="idTipoCosto"><USelectMenu v-model="state.idTipoCosto" :options="tiposOptions" value-attribute="value" option-attribute="label" :loading="tiposLoading" /></UFormGroup>
        <UFormGroup label="Descripción" name="descripcion"><UInput v-model="state.descripcion" /></UFormGroup>
        <UFormGroup label="Monto" name="monto"><UInput v-model.number="state.monto" type="number" /></UFormGroup>
        <UFormGroup label="Moneda" name="moneda"><UInput v-model="state.moneda" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
