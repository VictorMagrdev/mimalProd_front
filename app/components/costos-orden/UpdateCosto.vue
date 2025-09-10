<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useToast } from "#imports";

import GetCostoOrdenById from "~/graphql/costos-orden/get-costo-orden-by-id.graphql";
import UpdateCostoOrden from "~/graphql/costos-orden/update-costo-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetTiposCosto from "~/graphql/tipos-costo/get-tipos-costo.graphql";

const props = defineProps<{ open: boolean; costoId: string | null }>();
const emit = defineEmits<{ (e: "close"): void }>();

const toast = useToast();
const error = ref<string | null>(null);

interface CostoOrdenForm {
  idOrden?: string;
  idTipoCosto?: string;
  descripcion: string;
  monto: number;
  moneda: string;
}

const initialState: CostoOrdenForm = {
  idOrden: undefined,
  idTipoCosto: undefined,
  descripcion: "",
  monto: 0,
  moneda: "COP",
};

const state = reactive<CostoOrdenForm>({ ...initialState });

function resetForm() {
  Object.assign(state, initialState);
  error.value = null;
}

const { result, loading: queryLoading } = useQuery(
  GetCostoOrdenById,
  { id: computed(() => props.costoId) },
  { enabled: computed(() => !!props.costoId) }
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

// Queries para selects
const { data: ordenesResult, pending: ordenesLoading } =
  await useAsyncQuery<{ ordenesProduccion: { id: string; numeroOrden: string }[] }>(
    GetOrdenesProduccion
  );

const { data: tiposResult, pending: tiposLoading } =
  await useAsyncQuery<{ tiposCosto: { id: string; nombre: string }[] }>(
    GetTiposCosto
  );

const ordenesOptions = computed(() =>
  (ordenesResult.value?.ordenesProduccion ?? []).map((o) => ({
    id: o.id,
    label: o.numeroOrden,
  }))
);

const tiposOptions = computed(() =>
  (tiposResult.value?.tiposCosto ?? []).map((t) => ({
    id: t.id,
    label: t.nombre,
  }))
);

// Mutación para actualizar costo
const { mutate, loading: mutationLoading } = useMutation(UpdateCostoOrden);

async function onSubmit(event: FormSubmitEvent<CostoOrdenForm>) {
  error.value = null;
  if (!props.costoId) return;

  try {
    await mutate({ id: props.costoId, input: event.data });

    toast.add({
      title: "Éxito",
      description: "Costo de orden actualizado correctamente.",
      color: "success",
    });

    emit("close");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = message;
    toast.add({ title: "Error", description: message, color: "error" });
  }
}
</script>

<template>
  <UModal
    :open="props.open"
    title="Actualizar Costo de Orden"
    @close="emit('close')"
  >
    <template #description>
      Modifica los campos para actualizar la información del costo de orden.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    <div v-if="queryLoading" class="p-4">Cargando...</div>

    <template #body>
      <UForm
        id="updateCostoForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden de Producción" name="idOrden">
          <USelectMenu
            v-model="state.idOrden"
            :items="ordenesOptions"
            value-key="id"
            placeholder="Selecciona una orden"
            :loading="ordenesLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tipo de Costo" name="idTipoCosto">
          <USelectMenu
            v-model="state.idTipoCosto"
            :items="tiposOptions"
            value-key="id"
            placeholder="Selecciona un tipo de costo"
            :loading="tiposLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" class="w-full" />
        </UFormField>

        <UFormField label="Monto" name="monto">
          <UInput v-model.number="state.monto" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Moneda" name="moneda">
          <UInput v-model="state.moneda" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            resetForm();
            emit('close');
          }
        "
      />
      <UButton
        label="Actualizar"
        type="submit"
        color="neutral"
        form="updateCostoForm"
        :loading="mutationLoading"
      />
    </template>
  </UModal>
</template>
