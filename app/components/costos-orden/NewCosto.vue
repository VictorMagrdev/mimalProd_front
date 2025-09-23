<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useToast } from "#imports";

import CreateCostoOrden from "~/graphql/costos-orden/create-costo-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetTiposCosto from "~/graphql/tipos-costo/get-tipos-costo.graphql";

const open = ref(false);

type ID = string;

interface SelectItem {
  id: ID;
  label: string;
}

interface CostoOrdenForm {
  idOrden?: ID;
  idTipoCosto?: ID;
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

const state = reactive({ ...initialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, initialState);
  error.value = null;
}

const { data: ordenesResult } = useAsyncQuery<{
  ordenesProduccion: { id: ID; numeroOrden: string }[];
}>(GetOrdenesProduccion);

const { data: tiposResult } = useAsyncQuery<{
  tiposCosto: { id: ID; nombre: string }[];
}>(GetTiposCosto);

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

async function onSubmit(event: FormSubmitEvent<CostoOrdenForm>) {
  error.value = null;

  if (!state.idOrden || !state.idTipoCosto) {
    error.value = "Selecciona una orden y un tipo de costo.";
    return;
  }

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Éxito",
      description: "El costo de orden fue creado correctamente.",
      color: "success",
    });

    resetForm();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = message;
    toast.add({ title: "Error", description: message, color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear Costo de Orden">
    <template #description>
      Completa la información para registrar un costo en la orden de producción.
    </template>
    <UButton
      label="Nuevo costo"
      color="neutral"
      variant="subtle"
      @click="open = true"
    />
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="createCostoForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden de Producción" name="idOrden">
          <UInputMenu
            v-model="state.idOrden"
            :items="ordenesOptions"
            value-key="id"
            placeholder="Selecciona una orden"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tipo de Costo" name="idTipoCosto">
          <UInputMenu
            v-model="state.idTipoCosto"
            :items="tiposOptions"
            value-key="id"
            placeholder="Selecciona un tipo de costo"
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

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            close();
            resetForm();
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
