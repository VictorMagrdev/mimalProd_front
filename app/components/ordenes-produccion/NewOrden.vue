<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateOrdenProduccion from '~/graphql/ordenes-produccion/create-orden-produccion.graphql';
import GetLotesProduccion from '~/graphql/lotes-produccion/get-lotes-produccion.graphql';
import GetProductos from '~/graphql/productos/get-productos.graphql';
import GetUnidadesMedida from '~/graphql/unidades-medida/get-unidades-medida.graphql';
import GetEstadosOrden from '~/graphql/estados-orden/get-estados-orden.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { numeroOrden: '', idLote: undefined, idProducto: undefined, cantidad: 0, idUnidad: undefined, idEstado: undefined, inicioPlanificado: '', finPlanificado: '', observaciones: '' };
const state = reactive({ ...initialState });

// Queries for select menus
const { data: lotesResult, pending: lotesLoading } = await useAsyncQuery(GetLotesProduccion);
const { data: productosResult, pending: productosLoading } = await useAsyncQuery(GetProductos);
const { data: unidadesResult, pending: unidadesLoading } = await useAsyncQuery(GetUnidadesMedida);
const { data: estadosResult, pending: estadosLoading } = await useAsyncQuery(GetEstadosOrden);

const lotesOptions = computed(() => lotesResult.value?.lotesProduccion.map((l: any) => ({ label: l.numeroLote, value: l.id })) || []);
const productosOptions = computed(() => productosResult.value?.productos.map((p: any) => ({ label: p.nombre, value: p.id })) || []);
const unidadesOptions = computed(() => unidadesResult.value?.unidadesMedida.map((u: any) => ({ label: u.nombre, value: u.id })) || []);
const estadosOptions = computed(() => estadosResult.value?.estadosOrden.map((e: any) => ({ label: e.nombre, value: e.id })) || []);

const { mutate, loading } = useMutation(CreateOrdenProduccion);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Orden creada.' });
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
      <template #header><h2>Crear Orden de Producción</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="N° Orden" name="numeroOrden"><UInput v-model="state.numeroOrden" /></UFormGroup>
        <UFormGroup label="Producto" name="idProducto"><USelectMenu v-model="state.idProducto" :options="productosOptions" value-attribute="value" option-attribute="label" :loading="productosLoading" /></UFormGroup>
        <UFormGroup label="Lote" name="idLote"><USelectMenu v-model="state.idLote" :options="lotesOptions" value-attribute="value" option-attribute="label" :loading="lotesLoading" /></UFormGroup>
        <UFormGroup label="Cantidad" name="cantidad"><UInput v-model.number="state.cantidad" type="number" /></UFormGroup>
        <UFormGroup label="Unidad" name="idUnidad"><USelectMenu v-model="state.idUnidad" :options="unidadesOptions" value-attribute="value" option-attribute="label" :loading="unidadesLoading" /></UFormGroup>
        <UFormGroup label="Estado" name="idEstado"><USelectMenu v-model="state.idEstado" :options="estadosOptions" value-attribute="value" option-attribute="label" :loading="estadosLoading" /></UFormGroup>
        <UFormGroup label="Inicio Planificado" name="inicioPlanificado"><UInput v-model="state.inicioPlanificado" type="date" /></UFormGroup>
        <UFormGroup label="Fin Planificado" name="finPlanificado"><UInput v-model="state.finPlanificado" type="date" /></UFormGroup>
        <UFormGroup label="Observaciones" name="observaciones"><UTextarea v-model="state.observaciones" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
