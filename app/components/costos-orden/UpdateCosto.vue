<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { useQuery } from '#imports';
import GetCostoOrdenById from '~/graphql/costos-orden/get-costo-orden-by-id.graphql';
import UpdateCostoOrden from '~/graphql/costos-orden/update-costo-orden.graphql';
import GetOrdenesProduccion from '~/graphql/ordenes-produccion/get-ordenes-produccion.graphql';
import GetTiposCosto from '~/graphql/tipos-costo/get-tipos-costo.graphql';

const props = defineProps<{ isOpen: boolean; costoId: string | null; }>();
const emit = defineEmits(['close', 'updated']);

const state = reactive({ idOrden: undefined, idTipoCosto: undefined, descripcion: '', monto: 0, moneda: 'USD' });

const { result, loading: queryLoading } = useQuery(GetCostoOrdenById, { id: computed(() => props.costoId) }, { enabled: computed(() => !!props.costoId) });

watch(result, (newVal) => {
  if (newVal?.costoOrden) {
    const { descripcion, monto, moneda, orden, tipoCosto } = newVal.costoOrden;
    Object.assign(state, { descripcion, monto, moneda, idOrden: orden?.id, idTipoCosto: tipoCosto?.id });
  }
});

// Queries for select menus
const { data: ordenesResult, pending: ordenesLoading } = await useAsyncQuery(GetOrdenesProduccion);
const { data: tiposResult, pending: tiposLoading } = await useAsyncQuery(GetTiposCosto);

const ordenesOptions = computed(() => ordenesResult.value?.ordenesProduccion.map((o: any) => ({ label: o.numeroOrden, value: o.id })) || []);
const tiposOptions = computed(() => tiposResult.value?.tiposCosto.map((t: any) => ({ label: t.nombre, value: t.id })) || []);

const { mutate, loading: mutationLoading } = useMutation(UpdateCostoOrden);

const toast = useToast();

function closeModal() {
  emit('close');
}

async function onSubmit() {
  if (!props.costoId) return;
  try {
    await mutate({ id: props.costoId, input: state });
    toast.add({ title: 'Éxito', description: 'Costo de orden actualizado.' });
    emit('updated');
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
      <template #header><h2>Actualizar Costo de Orden</h2></template>
      <div v-if="queryLoading">Cargando...</div>
      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Orden de Producción" name="idOrden"><USelectMenu v-model="state.idOrden" :options="ordenesOptions" value-attribute="value" option-attribute="label" :loading="ordenesLoading" /></UFormGroup>
        <UFormGroup label="Tipo de Costo" name="idTipoCosto"><USelectMenu v-model="state.idTipoCosto" :options="tiposOptions" value-attribute="value" option-attribute="label" :loading="tiposLoading" /></UFormGroup>
        <UFormGroup label="Descripción" name="descripcion"><UInput v-model="state.descripcion" /></UFormGroup>
        <UFormGroup label="Monto" name="monto"><UInput v-model.number="state.monto" type="number" /></UFormGroup>
        <UFormGroup label="Moneda" name="moneda"><UInput v-model="state.moneda" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
