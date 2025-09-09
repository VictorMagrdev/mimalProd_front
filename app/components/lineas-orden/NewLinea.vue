<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateLineaOrden from '~/graphql/lineas-orden/create-linea-orden.graphql';
import GetOrdenesProduccion from '~/graphql/ordenes-produccion/get-ordenes-produccion.graphql';
import GetProductos from '~/graphql/productos/get-productos.graphql';
import GetUnidadesMedida from '~/graphql/unidades-medida/get-unidades-medida.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { idOrden: undefined, numeroLinea: 1, idProductoComponente: undefined, cantidadRequerida: 0, idUnidadComponente: undefined, observaciones: '' };
const state = reactive({ ...initialState });

// Queries for select menus
const { data: ordenesResult, pending: ordenesLoading } = await useAsyncQuery(GetOrdenesProduccion);
const { data: productosResult, pending: productosLoading } = await useAsyncQuery(GetProductos);
const { data: unidadesResult, pending: unidadesLoading } = await useAsyncQuery(GetUnidadesMedida);

const ordenesOptions = computed(() => ordenesResult.value?.ordenesProduccion.map((o: any) => ({ label: o.numeroOrden, value: o.id })) || []);
const productosOptions = computed(() => productosResult.value?.productos.map((p: any) => ({ label: p.nombre, value: p.id })) || []);
const unidadesOptions = computed(() => unidadesResult.value?.unidadesMedida.map((u: any) => ({ label: u.nombre, value: u.id })) || []);

const { mutate, loading } = useMutation(CreateLineaOrden);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Línea de orden creada.' });
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
      <template #header><h2>Crear Línea de Orden</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Orden de Producción" name="idOrden"><USelectMenu v-model="state.idOrden" :options="ordenesOptions" value-attribute="value" option-attribute="label" :loading="ordenesLoading" /></UFormGroup>
        <UFormGroup label="N° Línea" name="numeroLinea"><UInput v-model.number="state.numeroLinea" type="number" /></UFormGroup>
        <UFormGroup label="Producto Componente" name="idProductoComponente"><USelectMenu v-model="state.idProductoComponente" :options="productosOptions" value-attribute="value" option-attribute="label" :loading="productosLoading" /></UFormGroup>
        <UFormGroup label="Cantidad Requerida" name="cantidadRequerida"><UInput v-model.number="state.cantidadRequerida" type="number" /></UFormGroup>
        <UFormGroup label="Unidad Componente" name="idUnidadComponente"><USelectMenu v-model="state.idUnidadComponente" :options="unidadesOptions" value-attribute="value" option-attribute="label" :loading="unidadesLoading" /></UFormGroup>
        <UFormGroup label="Observaciones" name="observaciones"><UTextarea v-model="state.observaciones" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
