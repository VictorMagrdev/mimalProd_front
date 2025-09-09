<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import CreateOrdenProduccion from "~/graphql/ordenes-produccion/create-orden-produccion.graphql";
import GetLotesProduccion from "~/graphql/lotes-produccion/get-lotes-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";
import GetEstadosOrden from "~/graphql/estados-orden/get-estados-orden.graphql";

const open = ref(false);

// Tipados
interface Producto {
  id: string;
  nombre: string;
}
interface LoteProduccion {
  id: string;
  numeroLote: string;
}
interface UnidadMedida {
  id: string;
  nombre: string;
}
interface EstadoOrden {
  id: string;
  nombre: string;
}

interface OrdenProduccionFormState {
  numeroOrden: string;
  idLote?: string;
  idProducto?: string;
  cantidad: number;
  idUnidad?: string;
  idEstado?: string;
  inicioPlanificado: string;
  finPlanificado: string;
  observaciones: string;
}

// Estado inicial
const OrdenSchemaInitialState: OrdenProduccionFormState = {
  numeroOrden: "",
  idLote: undefined,
  idProducto: undefined,
  cantidad: 0,
  idUnidad: undefined,
  idEstado: undefined,
  inicioPlanificado: "",
  finPlanificado: "",
  observaciones: "",
};
const state = reactive({ ...OrdenSchemaInitialState });
const error = ref<string | null>(null);

// Queries
const {
  result: lotesResult,
  loading: lotesLoading,
  refetch: refetchLotes,
} = useQuery(GetLotesProduccion);
const {
  result: productosResult,
  loading: productosLoading,
  refetch: refetchProductos,
} = useQuery(GetProductos);
const {
  result: unidadesResult,
  loading: unidadesLoading,
  refetch: refetchUnidades,
} = useQuery(GetUnidadesMedida);
const {
  result: estadosResult,
  loading: estadosLoading,
  refetch: refetchEstados,
} = useQuery(GetEstadosOrden);

// Options tipados
const lotesOptions = computed(() =>
  (lotesResult.value?.lotesProduccion ?? []).map((l: LoteProduccion) => ({
    label: l.numeroLote,
    id: l.id.toString(),
  })),
);

const productosOptions = computed(() =>
  (productosResult.value?.productos ?? []).map((p: Producto) => ({
    label: p.nombre,
    id: p.id.toString(),
  })),
);

const unidadesOptions = computed(() =>
  (unidadesResult.value?.unidadesMedida ?? []).map((u: UnidadMedida) => ({
    label: u.nombre,
    id: u.id.toString(),
  })),
);

const estadosOptions = computed(() =>
  (estadosResult.value?.estadosOrden ?? []).map((e: EstadoOrden) => ({
    label: e.nombre,
    id: e.id.toString(),
  })),
);

// Refetch al abrir modal
watch(open, (isOpen) => {
  if (isOpen) {
    refetchLotes();
    refetchProductos();
    refetchUnidades();
    refetchEstados();
  }
});

// Reset
function resetForm() {
  Object.assign(state, OrdenSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateOrdenProduccion);

// Submit
async function onSubmit(event: FormSubmitEvent<OrdenProduccionFormState>) {
  error.value = null;
  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Orden creada",
      description: "La orden de producción fue registrada correctamente",
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = message;
    toast.add({
      title: "Error",
      description: message,
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear orden de producción">
    <template #description>
      Completa el formulario para registrar una nueva orden de producción.
    </template>

    <UButton
      class="right-0"
      label="Nueva orden"
      color="neutral"
      variant="subtle"
    />

    <UForm id="ordenForm" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Número de Orden" name="numeroOrden">
        <UInput
          v-model="state.numeroOrden"
          class="w-full"
          placeholder="Número de la orden"
        />
      </UFormField>

      <UFormField label="Producto" name="idProducto">
        <UInputMenu
          v-model="state.idProducto"
          :items="productosOptions"
          value-key="id"
          class="w-full"
          placeholder="Seleccione un producto"
          :loading="productosLoading"
        />
      </UFormField>

      <UFormField label="Lote" name="idLote">
        <UInputMenu
          v-model="state.idLote"
          :items="lotesOptions"
          value-key="id"
          class="w-full"
          placeholder="Seleccione un lote"
          :loading="lotesLoading"
        />
      </UFormField>

      <UFormField label="Cantidad" name="cantidad">
        <UInput
          v-model.number="state.cantidad"
          class="w-full"
          type="number"
          placeholder="0"
        />
      </UFormField>

      <UFormField label="Unidad" name="idUnidad">
        <UInputMenu
          v-model="state.idUnidad"
          :items="unidadesOptions"
          value-key="id"
          class="w-full"
          placeholder="Seleccione una unidad"
          :loading="unidadesLoading"
        />
      </UFormField>

      <UFormField label="Estado" name="idEstado">
        <UInputMenu
          v-model="state.idEstado"
          :items="estadosOptions"
          value-key="id"
          class="w-full"
          placeholder="Seleccione un estado"
          :loading="estadosLoading"
        />
      </UFormField>

      <UFormField label="Inicio Planificado" name="inicioPlanificado">
        <UInput v-model="state.inicioPlanificado" class="w-full" type="date" />
      </UFormField>

      <UFormField label="Fin Planificado" name="finPlanificado">
        <UInput v-model="state.finPlanificado" class="w-full" type="date" />
      </UFormField>

      <UFormField label="Observaciones" name="observaciones">
        <UTextarea
          v-model="state.observaciones"
          class="w-full"
          placeholder="Observaciones adicionales"
        />
      </UFormField>

      <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
    </UForm>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            close();
            open = false;
            resetForm();
          }
        "
      />
      <UButton
        label="Crear orden"
        type="submit"
        color="neutral"
        form="ordenForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
