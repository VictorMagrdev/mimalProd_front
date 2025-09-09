<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateLoteProduccion from '~/graphql/lotes-produccion/create-lote-produccion.graphql';
import GetProductos from '~/graphql/productos/get-productos.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { numeroLote: '', idProducto: undefined, fabricadoEn: '', venceEn: '' };
const state = reactive({ ...initialState });

const { data: productosResult, pending: productosLoading } = await useAsyncQuery(GetProductos);
const productosOptions = computed(() => 
  productosResult.value?.productos.map((p: any) => ({ label: p.nombre, value: p.id })) || []
);

const { mutate, loading } = useMutation(CreateLoteProduccion);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Lote creado.' });
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
      <template #header><h2>Crear Lote de Producción</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Número de Lote" name="numeroLote"><UInput v-model="state.numeroLote" /></UFormGroup>
        <UFormGroup label="Producto" name="idProducto">
          <USelectMenu v-model="state.idProducto" :options="productosOptions" value-attribute="value" option-attribute="label" :loading="productosLoading" />
        </UFormGroup>
        <UFormGroup label="Fabricado En" name="fabricadoEn"><UInput v-model="state.fabricadoEn" type="date" /></UFormGroup>
        <UFormGroup label="Vence En" name="venceEn"><UInput v-model="state.venceEn" type="date" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
