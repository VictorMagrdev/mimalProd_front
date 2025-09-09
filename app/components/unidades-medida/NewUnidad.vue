<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateUnidadMedida from '~/graphql/unidades-medida/create-unidad-medida.graphql';
import GetUnidadesMedidaTipo from '~/graphql/unidades-medida-tipo/get-unidades-medida-tipo.graphql';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);

const initialState = { codigo: '', nombre: '', abreviatura: '', idTipo: undefined, esActiva: true, esBase: false };
const state = reactive({ ...initialState });

// Fetch tipos for select menu
const { data: tiposResult, pending: tiposLoading } = await useAsyncQuery(GetUnidadesMedidaTipo);
const tiposOptions = computed(() => 
  tiposResult.value?.unidadesMedidaTipo.map((t: any) => ({ label: t.nombre, value: t.id })) || []
);

const { mutate, loading } = useMutation(CreateUnidadMedida);

const toast = useToast();

function closeModal() {
  Object.assign(state, initialState);
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Éxito', description: 'Unidad de medida creada.' });
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
      <template #header><h2>Crear Unidad de Medida</h2></template>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Código" name="codigo"><UInput v-model="state.codigo" /></UFormGroup>
        <UFormGroup label="Nombre" name="nombre"><UInput v-model="state.nombre" /></UFormGroup>
        <UFormGroup label="Abreviatura" name="abreviatura"><UInput v-model="state.abreviatura" /></UFormGroup>
        <UFormGroup label="Tipo" name="idTipo">
          <USelectMenu v-model="state.idTipo" :options="tiposOptions" value-attribute="value" option-attribute="label" :loading="tiposLoading" />
        </UFormGroup>
        <UFormGroup label="Activa" name="esActiva"><UCheckbox v-model="state.esActiva" /></UFormGroup>
        <UFormGroup label="Es Base" name="esBase"><UCheckbox v-model="state.esBase" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
