<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, watch, computed } from "vue";
import GetLineaOrdenById from "~/graphql/lineas-orden/get-linea-orden-by-id.graphql";
import UpdateLineaOrden from "~/graphql/lineas-orden/update-linea-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const props = defineProps<{ isOpen: boolean; lineaId: string | null }>();
const emit = defineEmits(["close", "updated"]);

interface LineaOrdenFormState {
  idOrden?: string;
  numeroLinea: number;
  idProductoComponente?: string;
  cantidadRequerida: number;
  idUnidadComponente?: string;
  observaciones: string;
}

const initialState: LineaOrdenFormState = {
  idOrden: undefined,
  numeroLinea: 1,
  idProductoComponente: undefined,
  cantidadRequerida: 0,
  idUnidadComponente: undefined,
  observaciones: "",
};

const state = reactive({ ...initialState });

const { result, loading: queryLoading } = useQuery(
  GetLineaOrdenById,
  { id: computed(() => props.lineaId) },
  { enabled: computed(() => !!props.lineaId) },
);

watch(result, (newVal) => {
  if (newVal?.lineaOrden) {
    const {
      numeroLinea,
      cantidadRequerida,
      observaciones,
      orden,
      productoComponente,
      unidadComponente,
    } = newVal.lineaOrden;
    Object.assign(state, {
      numeroLinea,
      cantidadRequerida,
      observaciones,
      idOrden: orden?.id,
      idProductoComponente: productoComponente?.id,
      idUnidadComponente: unidadComponente?.id,
    });
  }
});

// Queries for select menus
const { data: ordenesResult, pending: ordenesLoading } =
  await useAsyncQuery(GetOrdenesProduccion);
const { data: productosResult, pending: productosLoading } =
  await useAsyncQuery(GetProductos);
const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery(GetUnidadesMedida);

const ordenesOptions = computed(
  () =>
    ordenesResult.value?.ordenesProduccion.map((o: any) => ({
      label: o.numeroOrden,
      value: o.id,
    })) || [],
);

const productosOptions = computed(
  () =>
    productosResult.value?.productos.map((p: any) => ({
      label: p.nombre,
      value: p.id,
    })) || [],
);

const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u: any) => ({
      label: u.nombre,
      value: u.id,
    })) || [],
);

const { mutate, loading: mutationLoading } = useMutation(UpdateLineaOrden);
const toast = useToast();

function resetForm() {
  Object.assign(state, initialState);
}

function closeModal() {
  resetForm();
  emit("close");
}

async function onSubmit(event: FormSubmitEvent<LineaOrdenFormState>) {
  if (!props.lineaId) return;
  try {
    await mutate({ id: props.lineaId, input: event.data });
    toast.add({ title: "Éxito", description: "Línea de orden actualizada." });
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
      <template #header><h2>Actualizar Línea de Orden</h2></template>

      <div v-if="queryLoading">Cargando...</div>

      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Orden de Producción" name="idOrden">
          <USelectMenu
            v-model="state.idOrden"
            :options="ordenesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="ordenesLoading"
          />
        </UFormField>

        <UFormField label="N° Línea" name="numeroLinea">
          <UInput v-model.number="state.numeroLinea" type="number" />
        </UFormField>

        <UFormField label="Producto Componente" name="idProductoComponente">
          <USelectMenu
            v-model="state.idProductoComponente"
            :options="productosOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="productosLoading"
          />
        </UFormField>

        <UFormField label="Cantidad Requerida" name="cantidadRequerida">
          <UInput v-model.number="state.cantidadRequerida" type="number" />
        </UFormField>

        <UFormField label="Unidad Componente" name="idUnidadComponente">
          <USelectMenu
            v-model="state.idUnidadComponente"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            :loading="unidadesLoading"
          />
        </UFormField>

        <UFormField label="Observaciones" name="observaciones">
          <UTextarea v-model="state.observaciones" />
        </UFormField>

        <div class="flex justify-end space-x-2">
          <UButton variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="mutationLoading">Actualizar</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
