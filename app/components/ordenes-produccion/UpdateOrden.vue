<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed, watch } from "vue";
import GetOrdenProduccionById from "~/graphql/ordenes-produccion/get-orden-produccion-by-id.graphql";
import UpdateOrdenProduccion from "~/graphql/ordenes-produccion/update-orden-produccion.graphql";
import GetLotesProduccion from "~/graphql/lotes-produccion/get-lotes-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";
import GetEstadosOrden from "~/graphql/estados-orden/get-estados-orden.graphql";

const props = defineProps<{
  open: boolean;
  ordenId: string | null;
}>();
const emit = defineEmits<{ (e: "close"): void }>();

const error = ref<string | null>(null);

interface OrdenUpdateState {
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

const state = reactive<OrdenUpdateState>({
  numeroOrden: "",
  idLote: undefined,
  idProducto: undefined,
  cantidad: 0,
  idUnidad: undefined,
  idEstado: undefined,
  inicioPlanificado: "",
  finPlanificado: "",
  observaciones: "",
});

const { result: ordenResult, loading: ordenLoading } = useQuery(
  GetOrdenProduccionById,
  { id: computed(() => props.ordenId) },
  { enabled: computed(() => !!props.ordenId) },
);

watch(ordenResult, (newVal) => {
  if (newVal?.ordenProduccion) {
    const orden = newVal.ordenProduccion;
    state.numeroOrden = orden.numeroOrden;
    state.cantidad = orden.cantidad;
    state.inicioPlanificado = orden.inicioPlanificado;
    state.finPlanificado = orden.finPlanificado;
    state.observaciones = orden.observaciones;
    state.idLote = orden.lote?.id;
    state.idProducto = orden.producto?.id;
    state.idUnidad = orden.unidad?.id;
    state.idEstado = orden.estado?.id;
  }
});

// Interfaces de entidades
interface LoteProduccion {
  id: string;
  numeroLote: string;
}
interface Producto {
  id: string;
  nombre: string;
}
interface UnidadMedida {
  id: string;
  nombre: string;
}
interface EstadoOrden {
  id: string;
  nombre: string;
}

// Interfaces de resultados de queries
interface LotesProduccionResult {
  lotesProduccion: LoteProduccion[];
}
interface ProductosResult {
  productos: Producto[];
}
interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}
interface EstadosOrdenResult {
  estadosOrden: EstadoOrden[];
}

// Queries tipadas
const {
  result: lotesResult,
  loading: lotesLoading,
  refetch: refetchLotes,
} = useQuery<LotesProduccionResult>(GetLotesProduccion);

const {
  result: productosResult,
  loading: productosLoading,
  refetch: refetchProductos,
} = useQuery<ProductosResult>(GetProductos);

const {
  result: unidadesResult,
  loading: unidadesLoading,
  refetch: refetchUnidades,
} = useQuery<UnidadesMedidaResult>(GetUnidadesMedida);

const {
  result: estadosResult,
  loading: estadosLoading,
  refetch: refetchEstados,
} = useQuery<EstadosOrdenResult>(GetEstadosOrden);

// Options tipados
const lotesOptions = computed(
  () =>
    lotesResult.value?.lotesProduccion.map((l) => ({
      label: l.numeroLote,
      value: l.id,
    })) ?? [],
);

const productosOptions = computed(
  () =>
    productosResult.value?.productos.map((p) => ({
      label: p.nombre,
      value: p.id,
    })) ?? [],
);

const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      label: u.nombre,
      value: u.id,
    })) ?? [],
);

const estadosOptions = computed(
  () =>
    estadosResult.value?.estadosOrden.map((e) => ({
      label: e.nombre,
      value: e.id,
    })) ?? [],
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      refetchLotes();
      refetchProductos();
      refetchUnidades();
      refetchEstados();
    }
  },
);

const toast = useToast();
const { mutate, loading: updateLoading } = useMutation(UpdateOrdenProduccion);

function resetForm() {
  state.numeroOrden = "";
  state.idLote = undefined;
  state.idProducto = undefined;
  state.cantidad = 0;
  state.idUnidad = undefined;
  state.idEstado = undefined;
  state.inicioPlanificado = "";
  state.finPlanificado = "";
  state.observaciones = "";
}

async function onSubmit(event: FormSubmitEvent<OrdenUpdateState>) {
  error.value = null;

  if (!props.ordenId) return;

  try {
    await mutate({ id: props.ordenId, input: event.data });

    toast.add({
      title: "Orden actualizada",
      description: "La orden de producción fue actualizada correctamente",
      color: "success",
    });

    emit("close");
  } catch (e: unknown) {
    const message =
      typeof e === "object" && e !== null && "message" in e
        ? (e as { message: string }).message
        : String(e);
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
  <UModal
    :open="props.open"
    title="Actualizar orden de producción"
    @close="emit('close')"
  >
    <template #description>
      Modifica los campos para actualizar la información de la orden de
      producción.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <div v-if="ordenLoading" class="text-center py-4">Cargando datos...</div>

      <UForm
        v-else
        id="updateOrdenForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
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
            :options="productosOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione un producto"
            :loading="productosLoading"
          />
        </UFormField>

        <UFormField label="Lote" name="idLote">
          <UInputMenu
            v-model="state.idLote"
            :options="lotesOptions"
            value-key="value"
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
            :options="unidadesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            :loading="unidadesLoading"
          />
        </UFormField>

        <UFormField label="Estado" name="idEstado">
          <UInputMenu
            v-model="state.idEstado"
            :options="estadosOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione un estado"
            :loading="estadosLoading"
          />
        </UFormField>

        <UFormField label="Inicio Planificado" name="inicioPlanificado">
          <UInput
            v-model="state.inicioPlanificado"
            class="w-full"
            type="date"
          />
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
        form="updateOrdenForm"
        :loading="updateLoading"
      />
    </template>
  </UModal>
</template>
