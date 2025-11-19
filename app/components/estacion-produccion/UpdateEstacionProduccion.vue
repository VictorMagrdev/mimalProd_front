<script setup lang="ts">
import { useQuery } from "#imports";
import { computed, reactive, watch } from "vue";
import GetTipoCostoById from "~/graphql/tipos-costo/get-tipo-costo-by-id.graphql";
import UpdateTipoCosto from "~/graphql/tipos-costo/update-tipo-costo.graphql";

const props = defineProps<{ isOpen: boolean; tipoCostoId: string | null }>();
const emit = defineEmits(["close", "updated"]);

interface TipoCostoUpdateState {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

const state = reactive<TipoCostoUpdateState>({
  codigo: "",
  nombre: "",
  descripcion: "",
  activo: true,
});

const { result, loading: queryLoading } = useQuery(
  GetTipoCostoById,
  { id: computed(() => props.tipoCostoId) },
  { enabled: computed(() => !!props.tipoCostoId) },
);

watch(result, (newVal) => {
  if (newVal?.tipoCosto) {
    const { codigo, nombre, descripcion, activo } = newVal.tipoCosto;
    Object.assign(state, { codigo, nombre, descripcion, activo });
  }
});

const { mutate, loading: mutationLoading } = useMutation(UpdateTipoCosto);

const toast = useToast();

function closeModal() {
  emit("close");
}

async function onSubmit() {
  if (!props.tipoCostoId) return;
  try {
    await mutate({ id: props.tipoCostoId, input: state });
    toast.add({ title: "Éxito", description: "Tipo de costo actualizado." });
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
        <h2>Actualizar Tipo de Costo</h2>
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
