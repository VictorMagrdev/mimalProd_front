<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed, watch } from "vue";
import CreateReservaMaterialOrden from "~/graphql/reserva-material-orden/create-reserva-material-orden.graphql";
import OrdenesConDetalles from "~/graphql/reserva-material-orden/get-ordenes-detalladas.graphql";

const open = ref(false);

interface ReservaMaterialOrdenFormState {
  ordenId: string;
  productoId: string;
  loteId?: string;
  cantidad: number;
  unidadId: string;
}

const ReservaMaterialOrdenSchemaInitialState: ReservaMaterialOrdenFormState = {
  ordenId: "",
  productoId: "",
  loteId: "",
  cantidad: 0,
  unidadId: "",
};

const state = reactive({ ...ReservaMaterialOrdenSchemaInitialState });
const error = ref<string | null>(null);

interface OrdenesConDetallesData {
  ordenesProduccion: {
    id: string;
    numeroOrden: string;
    idProducto: string;
    idLote?: string;
    idUnidad: string;
  }[];
}

const { result } = useQuery<OrdenesConDetallesData>(OrdenesConDetalles);

const ordenesOptions = computed(
  () =>
    result.value?.ordenesProduccion.map((o) => ({
      label: o.numeroOrden,
      value: o.id,
    })) ?? [],
);

watch(
  () => state.ordenId,
  (newOrdenId) => {
    const orden = result.value?.ordenesProduccion.find(
      (o) => o.id === newOrdenId,
    );
    if (orden) {
      state.productoId = orden.idProducto;
      state.loteId = orden.idLote ?? "";
      state.unidadId = orden.idUnidad;
    } else {
      state.productoId = "";
      state.loteId = "";
      state.unidadId = "";
    }
  },
);

function resetForm() {
  Object.assign(state, ReservaMaterialOrdenSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateReservaMaterialOrden);

async function onSubmit(event: FormSubmitEvent<ReservaMaterialOrdenFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Reserva creada",
      description: "La reserva de material se registró correctamente",
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({
      title: "Error",
      description: String(e),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear Reserva de Material">
    <template #description>
      Selecciona la orden de producción para reservar material.
    </template>

    <UButton
      class="right-0"
      label="Nueva reserva"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="reservaForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden de Producción" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            :options="ordenesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una orden"
            searchable
          />
        </UFormField>

        <UFormField label="Producto" name="productoId">
          <UInput v-model="state.productoId" class="w-full" disabled />
        </UFormField>

        <UFormField label="Lote" name="loteId">
          <UInput v-model="state.loteId" class="w-full" disabled />
        </UFormField>

        <UFormField label="Unidad de Medida" name="unidadId">
          <UInput v-model="state.unidadId" class="w-full" disabled />
        </UFormField>

        <UFormField label="Cantidad" name="cantidad">
          <UInput
            v-model="state.cantidad"
            type="number"
            class="w-full"
            placeholder="Ingrese la cantidad"
          />
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
        label="Crear Reserva"
        type="submit"
        color="neutral"
        form="reservaForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
