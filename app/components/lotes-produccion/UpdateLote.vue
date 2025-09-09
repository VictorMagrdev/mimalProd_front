<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import { useQuery } from "#imports";
import GetLoteProduccionById from "~/graphql/lotes-produccion/get-lote-produccion-by-id.graphql";
import UpdateLoteProduccion from "~/graphql/lotes-produccion/update-lote-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";

const props = defineProps<{ isOpen: boolean; loteId: string | null }>();
const emit = defineEmits(["close", "updated"]);

const state = reactive({
  numeroLote: "",
  idProducto: undefined,
  fabricadoEn: "",
  venceEn: "",
});

const { result, loading: queryLoading } = useQuery(
  GetLoteProduccionById,
  { id: computed(() => props.loteId) },
  { enabled: computed(() => !!props.loteId) },
);

watch(result, (newVal) => {
  if (newVal?.loteProduccion) {
    const { numeroLote, fabricadoEn, venceEn, producto } =
      newVal.loteProduccion;
    Object.assign(state, {
      numeroLote,
      fabricadoEn,
      venceEn,
      idProducto: producto?.id,
    });
  }
});

const { data: productosResult, pending: productosLoading } =
  await useAsyncQuery(GetProductos);
const productosOptions = computed(
  () =>
    productosResult.value?.productos.map((p: any) => ({
      label: p.nombre,
      value: p.id,
    })) || [],
);

const { mutate, loading: mutationLoading } = useMutation(UpdateLoteProduccion);

const toast = useToast();

function closeModal() {
  emit("close");
}

async function onSubmit() {
  if (!props.loteId) return;
  try {
    await mutate({ id: props.loteId, input: state });
    toast.add({ title: "Éxito", description: "Lote actualizado." });
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
      <template #header><h2>Actualizar Lote de Producción</h2></template>
      <div v-if="queryLoading">Cargando...</div>
      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Número de Lote" name="numeroLote"
          ><UInput v-model="state.numeroLote"
        /></UFormGroup>
        <UFormGroup label="Producto" name="idProducto">
          <USelectMenu
            v-model="state.idProducto"
            :options="productosOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="productosLoading"
          />
        </UFormGroup>
        <UFormGroup label="Fabricado En" name="fabricadoEn"
          ><UInput v-model="state.fabricadoEn" type="date"
        /></UFormGroup>
        <UFormGroup label="Vence En" name="venceEn"
          ><UInput v-model="state.venceEn" type="date"
        /></UFormGroup>
        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
