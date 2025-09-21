<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, watch, computed } from "vue";
import GetEstadoOrdenById from "~/graphql/estados-orden/get-estado-orden-by-id.graphql";
import UpdateEstadoOrden from "~/graphql/estados-orden/update-estado-orden.graphql";

const props = defineProps<{ 
  isOpen: boolean; 
  estadoId: string | null 
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

interface EstadoOrdenFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

const initialState: EstadoOrdenFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  activo: true,
};

const state = reactive({ ...initialState });

const { result, loading: queryLoading } = useQuery(
  GetEstadoOrdenById,
  { id: computed(() => props.estadoId) },
  { enabled: computed(() => !!props.estadoId) },
);

watch(result, (newVal) => {
  if (newVal?.estadoOrden) {
    const { codigo, nombre, descripcion, activo } = newVal.estadoOrden;
    Object.assign(state, { codigo, nombre, descripcion, activo });
  }
});

const { mutate, loading: mutationLoading } = useMutation(UpdateEstadoOrden);
const toast = useToast();

function resetForm() {
  Object.assign(state, initialState);
}

function closeModal() {
  resetForm();
  emit("close");
}

async function onSubmit(event: FormSubmitEvent<EstadoOrdenFormState>) {
  if (!props.estadoId) return;
  try {
    await mutate({ id: props.estadoId, input: event.data });
    toast.add({ title: "Éxito", description: "Estado de orden actualizado." });
    emit("close");
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
      <template #header><h2>Actualizar Estado de Orden</h2></template>

      <div v-if="queryLoading">Cargando...</div>

      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" />
        </UFormField>

        <UFormField label="Activo" name="activo">
          <UCheckbox v-model="state.activo" />
        </UFormField>

        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
