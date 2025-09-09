<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { useQuery } from '#imports';
import GetEstadoOrdenById from '~/graphql/estados-orden/get-estado-orden-by-id.graphql';
import UpdateEstadoOrden from '~/graphql/estados-orden/update-estado-orden.graphql';

const props = defineProps<{ isOpen: boolean; estadoId: string | null; }>();
const emit = defineEmits(['close', 'updated']);

const state = reactive({ codigo: '', nombre: '', descripcion: '', activo: true });

const { result, loading: queryLoading } = useQuery(GetEstadoOrdenById, { id: computed(() => props.estadoId) }, { enabled: computed(() => !!props.estadoId) });

watch(result, (newVal) => {
  if (newVal?.estadoOrden) {
    const { codigo, nombre, descripcion, activo } = newVal.estadoOrden;
    Object.assign(state, { codigo, nombre, descripcion, activo });
  }
});

const { mutate, loading: mutationLoading } = useMutation(UpdateEstadoOrden);

const toast = useToast();

function closeModal() {
  emit('close');
}

async function onSubmit() {
  if (!props.estadoId) return;
  try {
    await mutate({ id: props.estadoId, input: state });
    toast.add({ title: 'Éxito', description: 'Estado de orden actualizado.' });
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
      <template #header><h2>Actualizar Estado de Orden</h2></template>
      <div v-if="queryLoading">Cargando...</div>
      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Código" name="codigo"><UInput v-model="state.codigo" /></UFormGroup>
        <UFormGroup label="Nombre" name="nombre"><UInput v-model="state.nombre" /></UFormGroup>
        <UFormGroup label="Descripción" name="descripcion"><UInput v-model="state.descripcion" /></UFormGroup>
        <UFormGroup label="Activo" name="activo"><UCheckbox v-model="state.activo" /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
