<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import GetUnidadMedidaById from '~/graphql/unidades-medida/get-unidad-medida-by-id.graphql';
import UpdateUnidadMedida from '~/graphql/unidades-medida/update-unidad-medida.graphql';
import GetUnidadesMedidaTipo from '~/graphql/unidades-medida-tipo/get-unidades-medida-tipo.graphql';
const props = defineProps<{ isOpen: boolean; unidadId: string | null; }>();
const emit = defineEmits(['close', 'updated']);

const state = reactive({ codigo: '', nombre: '', abreviatura: '', idTipo: undefined, esActiva: true, esBase: false });

const { result, loading: queryLoading } = useQuery(GetUnidadMedidaById, { id: computed(() => props.unidadId) }, { enabled: computed(() => !!props.unidadId) });

watch(result, (newVal) => {
  if (newVal?.unidadMedida) {
    const { codigo, nombre, abreviatura, esActiva, esBase, tipo } = newVal.unidadMedida;
    Object.assign(state, { codigo, nombre, abreviatura, esActiva, esBase, idTipo: tipo?.id });
  }
});

// Fetch tipos for select menu
const { data: tiposResult, pending: tiposLoading } = await useAsyncQuery(GetUnidadesMedidaTipo);
const tiposOptions = computed(() => 
  tiposResult.value?.unidadesMedidaTipo.map((t: any) => ({ label: t.nombre, value: t.id })) || []
);

const { mutate, loading: mutationLoading } = useMutation(UpdateUnidadMedida);

const toast = useToast();

function closeModal() {
  emit('close');
}

async function onSubmit() {
  if (!props.unidadId) return;
  try {
    await mutate({ id: props.unidadId, input: state });
    toast.add({ title: 'Éxito', description: 'Unidad de medida actualizada.' });
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
      <template #header><h2>Actualizar Unidad de Medida</h2></template>
      <div v-if="queryLoading">Cargando...</div>
      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Código" name="codigo"><UInput v-model="state.codigo" /></UFormGroup>
        <UFormGroup label="Nombre" name="nombre"><UInput v-model="state.nombre" /></UFormGroup>
        <UFormGroup label="Abreviatura" name="abreviatura"><UInput v-model="state.abreviatura" /></UFormGroup>
        <UFormGroup label="Tipo" name="idTipo">
          <USelectMenu v-model="state.idTipo" :options="tiposOptions" value-attribute="value" option-attribute="label" :loading="tiposLoading" />
        </UFormGroup>
        <UFormGroup label="Activa" name="esActiva"><UCheckbox v-model="state.esActiva" /></UFormGroup>
        <UFormGroup label="Es Base" name="esBase"><UCheckbox v-model="state.esBase" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
