<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, watch, computed } from "vue";
import GetCostoOrdenById from "~/graphql/costos-orden/get-costo-orden-by-id.graphql";
import UpdateCostoOrden from "~/graphql/costos-orden/update-costo-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetTiposCosto from "~/graphql/tipos-costo/get-tipos-costo.graphql";

const props = defineProps<{ isOpen: boolean; costoId: string | null }>();
const emit = defineEmits(["close", "updated"]);

interface CostoOrdenFormState {
  idOrden?: string;
  idTipoCosto?: string;
  descripcion: string;
  monto: number;
  moneda: string;
}

const initialState: CostoOrdenFormState = {
  idOrden: undefined,
  idTipoCosto: undefined,
  descripcion: "",
  monto: 0,
  moneda: "COP",
};

const state = reactive({ ...initialState });

// Query del costo a editar
const { result, loading: queryLoading } = useQuery(
  GetCostoOrdenById,
  { id: computed(() => props.costoId) },
  { enabled: computed(() => !!props.costoId) },
);

watch(result, (newVal) => {
  if (newVal?.costoOrden) {
    const { descripcion, monto, moneda, orden, tipoCosto } = newVal.costoOrden;
    Object.assign(state, {
      descripcion,
      monto,
      moneda,
      idOrden: orden?.id,
      idTipoCosto: tipoCosto?.id,
    });
  }
});

interface OrdenProduccion {
  id: string;
  numeroOrden: string;
}
interface TipoCosto {
  id: string;
  nombre: string;
}
interface OrdenesProduccionResult {
  ordenesProduccion: OrdenProduccion[];
}
interface TiposCostoResult {
  tiposCosto: TipoCosto[];
}

const { data: tiposResult, pending: tiposLoading } =
  await useAsyncQuery<TiposCostoResult>(GetTiposCosto);
const { data: ordenesResult, pending: ordenesLoading } =
  await useAsyncQuery<OrdenesProduccionResult>(GetOrdenesProduccion);

const ordenesOptions = computed(() =>
  ordenesResult.value?.ordenesProduccion.map((o) => ({
    id: o.id,
    label: o.numeroOrden,
  })),
);

const tiposOptions = computed(() =>
  tiposResult.value?.tiposCosto.map((t) => ({
    id: t.id,
    label: t.nombre,
  })),
);

const { mutate, loading: mutationLoading } = useMutation(UpdateCostoOrden);
const toast = useToast();

function resetForm() {
  Object.assign(state, initialState);
}

function closeModal() {
  resetForm();
  emit("close");
}

async function onSubmit(event: FormSubmitEvent<CostoOrdenFormState>) {
  if (!props.costoId) return;
  try {
    await mutate({ id: props.costoId, input: event.data });
    toast.add({ title: "Éxito", description: "Costo de orden actualizado." });
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
      <template #header><h2>Actualizar Costo de Orden</h2></template>

      <div v-if="queryLoading">Cargando...</div>

      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Orden de Producción" name="idOrden">
          <USelectMenu
            v-model="state.idOrden"
            :options="ordenesOptions"
            value-attribute="id"
            option-attribute="label"
            :loading="ordenesLoading"
          />
        </UFormField>

        <UFormField label="Tipo de Costo" name="idTipoCosto">
          <USelectMenu
            v-model="state.idTipoCosto"
            :options="tiposOptions"
            value-attribute="id"
            option-attribute="label"
            :loading="tiposLoading"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" />
        </UFormField>

        <UFormField label="Monto" name="monto">
          <UInput v-model.number="state.monto" type="number" />
        </UFormField>

        <UFormField label="Moneda" name="moneda">
          <UInput v-model="state.moneda" />
        </UFormField>

        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
