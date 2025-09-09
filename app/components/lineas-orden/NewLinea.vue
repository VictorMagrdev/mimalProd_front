<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import CreateLineaOrden from "~/graphql/lineas-orden/create-linea-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

// Tipados
interface OrdenProduccion {
  id: string;
  numeroOrden: string;
}
interface Producto {
  id: string;
  nombre: string;
}
interface UnidadMedida {
  id: string;
  nombre: string;
}

// Props y emits
const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close", "created"]);

// Estado inicial
const initialState = {
  idOrden: "" as string | undefined,
  numeroLinea: 1,
  idProductoComponente: "" as string | undefined,
  cantidadRequerida: 0,
  idUnidadComponente: "" as string | undefined,
  observaciones: "",
};
const state = reactive({ ...initialState });

// Queries
const { data: ordenesResult, pending: ordenesLoading } =
  await useAsyncQuery(GetOrdenesProduccion);
const { data: productosResult, pending: productosLoading } =
  await useAsyncQuery(GetProductos);
const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery(GetUnidadesMedida);

// Options tipados
const ordenesOptions = computed(() =>
  (ordenesResult.value?.ordenesProduccion || []).map(
    (o: OrdenProduccion) => ({
      label: o.numeroOrden,
      id: o.id.toString(),
    }),
  ),
);
const productosOptions = computed(() =>
  (productosResult.value?.productos || []).map((p: Producto) => ({
    label: p.nombre,
    id: p.id.toString(),
  })),
);
const unidadesOptions = computed(() =>
  (unidadesResult.value?.unidadesMedida || []).map((u: UnidadMedida) => ({
    label: u.nombre,
    id: u.id.toString(),
  })),
);

// Mutación
const { mutate, loading } = useMutation(CreateLineaOrden);

// Otros refs
const toast = useToast();
const error = ref<string | null>(null);

// Funciones
function closeModal() {
  Object.assign(state, initialState);
  emit("close");
}

async function onSubmit(event: FormSubmitEvent<typeof initialState>) {
  try {
    error.value = null;
    await mutate({ input: event.data });
    toast.add({ title: "Éxito", description: "Línea de orden creada." });
    emit("created");
    closeModal();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    error.value = message;
    toast.add({ title: "Error", description: message });
  }
}
</script>

<template>
  <UModal :model-value="props.isOpen" @update:model-value="closeModal">
    <template #header>
      <h2>Crear Línea de Orden</h2>
    </template>

    <UForm
      id="create-linea-orden-form"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField label="Orden de Producción" name="idOrden">
        <USelectMenu
          v-model="state.idOrden"
          :options="ordenesOptions"
          value-attribute="id"
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
          value-attribute="id"
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
          value-attribute="id"
          option-attribute="label"
          :loading="unidadesLoading"
        />
      </UFormField>

      <UFormField label="Observaciones" name="observaciones">
        <UTextarea v-model="state.observaciones" />
      </UFormField>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </UForm>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            close();
            closeModal();
          }
        "
      />
      <UButton
        label="Crear"
        type="submit"
        color="neutral"
        form="create-linea-orden-form"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
