<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import GetUnidadMedidaTipoById from "~/graphql/unidades-medida-tipo/get-unidad-medida-tipo-by-id.graphql";
import UpdateUnidadMedidaTipo from "~/graphql/unidades-medida-tipo/update-unidad-medida-tipo.graphql";

const props = defineProps<{ isOpen: boolean; tipoId: string | null }>();
const emit = defineEmits(["close", "updated"]);

interface UnidadMedidaTipoUpdateState {
  codigo: string;
  nombre: string;
  descripcion: string;
}

const state = reactive<UnidadMedidaTipoUpdateState>({
  codigo: "",
  nombre: "",
  descripcion: "",
});

const { result, loading: queryLoading } = useQuery(
  GetUnidadMedidaTipoById,
  { id: computed(() => props.tipoId) },
  { enabled: computed(() => !!props.tipoId) },
);

watch(result, (newVal) => {
  if (newVal?.unidadMedidaTipo) {
    const { codigo, nombre, descripcion } = newVal.unidadMedidaTipo;
    Object.assign(state, { codigo, nombre, descripcion });
  }
});

const { mutate, loading: mutationLoading } = useMutation(UpdateUnidadMedidaTipo);

const toast = useToast();

function closeModal() {
  emit("close");
}

async function onSubmit() {
  if (!props.tipoId) return;
  try {
    await mutate({ id: props.tipoId, input: state });
    toast.add({
      title: "Éxito",
      description: "Tipo de unidad de medida actualizado.",
    });
    emit("updated");
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
      <template #header>
        <h2>Actualizar Tipo de Unidad de Medida</h2>
      </template>

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

        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
