<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useToast } from "#imports";

import CreateCostoOrden from "~/graphql/costos-orden/create-costo-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetTiposCosto from "~/graphql/tipos-costo/get-tipos-costo.graphql";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close", "created"]);

type ID = string;

interface SelectItem {
  id: ID;
  label: string;
}

interface OrdenProduccion {
  id: ID;
  numeroOrden: string;
}

interface TipoCosto {
  id: ID;
  nombre: string;
}

const error = ref<string | null>(null);

const state = reactive({
  idOrden: undefined as ID | undefined,
  idTipoCosto: undefined as ID | undefined,
  descripcion: "",
  monto: 0,
  moneda: "USD",
});

function resetForm() {
  state.idOrden = undefined;
  state.idTipoCosto = undefined;
  state.descripcion = "";
  state.monto = 0;
  state.moneda = "USD";
  error.value = null;
}

const { data: ordenesResult } =
  useAsyncQuery<{ ordenesProduccion: OrdenProduccion[] }>(GetOrdenesProduccion);

const { data: tiposResult } =
  useAsyncQuery<{ tiposCosto: TipoCosto[] }>(GetTiposCosto);

const ordenesOptions = computed<SelectItem[]>(() =>
  (ordenesResult.value?.ordenesProduccion ?? []).map((o) => ({
    id: o.id,
    label: o.numeroOrden,
  })),
);

const tiposOptions = computed<SelectItem[]>(() =>
  (tiposResult.value?.tiposCosto ?? []).map((t) => ({
    id: t.id,
    label: t.nombre,
  })),
);

const { mutate, loading } = useMutation(CreateCostoOrden);
const toast = useToast();

async function onSubmit() {
  error.value = null;

  if (!state.idOrden || !state.idTipoCosto) {
    error.value = "Selecciona una orden y un tipo de costo.";
    return;
  }

  try {
    await mutate({
      input: {
        idOrden: state.idOrden,
        idTipoCosto: state.idTipoCosto,
        descripcion: state.descripcion,
        monto: state.monto,
        moneda: state.moneda,
      },
    });

    toast.add({
      title: "Éxito",
      description: "El costo de orden fue creado correctamente.",
      color: "success",
    });

    resetForm();
    emit("created");
    emit("close");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = message;
    toast.add({ title: "Error", description: message, color: "error" });
  }
}
</script>

<template>
  <UModal :open="props.isOpen" title="Crear Costo de Orden" @close="emit('close')">
    <template #description>
      Completa la información para registrar un costo en la orden de producción.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm id="createCostoForm" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Orden de Producción" name="idOrden">
          <USelectMenu
            v-model="state.idOrden"
            :items="ordenesOptions"
            value-key="id"
            placeholder="Selecciona una orden"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tipo de Costo" name="idTipoCosto">
          <USelectMenu
            v-model="state.idTipoCosto"
            :items="tiposOptions"
            value-key="id"
            placeholder="Selecciona un tipo de costo"
            class="w-full"
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
        label="Crear"
        type="submit"
        color="neutral"
        form="createCostoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
