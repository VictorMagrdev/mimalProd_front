<script setup lang="ts">
import { reactive } from 'vue';
import CreateUnidadMedidaTipo from '~/graphql/unidades-medida-tipo/create-unidad-medida-tipo.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { codigo: '', nombre: '', descripcion: '' };
const state = reactive({ ...initialState });

const { mutate, loading } = useMutation(CreateUnidadMedidaTipo);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Tipo de unidad de medida creado.' });
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
      <template #header><h2>Crear Tipo de Unidad de Medida</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Código" name="codigo"><UInput v-model="state.codigo" /></UFormGroup>
        <UFormGroup label="Nombre" name="nombre"><UInput v-model="state.nombre" /></UFormGroup>
        <UFormGroup label="Descripción" name="descripcion"><UInput v-model="state.descripcion" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
