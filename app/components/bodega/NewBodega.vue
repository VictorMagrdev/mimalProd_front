<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import CreateLineaOrden from "~/graphql/lineas-orden/create-linea-orden.graphql";
import GetOrdenesProduccion from "~/graphql/ordenes-produccion/get-ordenes-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";
import GetUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const emit = defineEmits<{ (e: "create"): void }>();

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

const open = ref(false);

const initialState = {
  idOrden: "" as string | undefined,
  numeroLinea: 1,
  idProductoComponente: "" as string | undefined,
  cantidadRequerida: 0,
  idUnidadComponente: "" as string | undefined,
  observaciones: "",
};
const state = reactive({ ...initialState });

// Interfaces de entidades
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

interface OrdenesProduccionResult {
  ordenesProduccion: OrdenProduccion[];
}
interface ProductosResult {
  productos: Producto[];
}
interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

const { data: ordenesResult, pending: ordenesLoading } =
  await useAsyncQuery<OrdenesProduccionResult>(GetOrdenesProduccion);

const { data: productosResult, pending: productosLoading } =
  await useAsyncQuery<ProductosResult>(GetProductos);

const { data: unidadesResult, pending: unidadesLoading } =
  await useAsyncQuery<UnidadesMedidaResult>(GetUnidadesMedida);

const ordenesOptions = computed(
  () =>
    ordenesResult.value?.ordenesProduccion.map((o) => ({
      id: o.id,
      label: o.numeroOrden,
    })) ?? [],
);

const productosOptions = computed(
  () =>
    productosResult.value?.productos.map((p) => ({
      id: p.id,
      label: p.nombre,
    })) ?? [],
);

const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      id: u.id,
      label: u.nombre,
    })) ?? [],
);

const { mutate, loading } = useMutation(CreateLineaOrden);

const toast = useToast();
const error = ref<string | null>(null);

function closeModal() {
  Object.assign(state, initialState);
}

async function onSubmit(event: FormSubmitEvent<typeof initialState>) {
  try {
    error.value = null;
    await mutate({ input: event.data });
    toast.add({ title: "Éxito", description: "Línea de orden creada." });
    closeModal();
  } catch (err) {
    toast.add({
      title: "Error",
      description: String(err),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal :model-value="open" @update:model-value="closeModal">
    <template #header>
      <h2>Crear Línea de Orden</h2>
    </template>
    <UButton
      label="Nueva linea"
      color="neutral"
      variant="subtle"
      @click="open = true"
    />
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="create-linea-orden-form"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden de Producción" name="idOrden">
          <UInputMenu
            v-model="state.idOrden"
            :items="ordenesOptions"
            value-attribute="label"
            :loading="ordenesLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="N° Línea" name="numeroLinea">
          <UInput
            v-model.number="state.numeroLinea"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Producto Componente" name="idProductoComponente">
          <UInputMenu
            v-model="state.idProductoComponente"
            :items="productosOptions"
            value-attribute="id"
            option-attribute="label"
            :loading="productosLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Cantidad Requerida" name="cantidadRequerida">
          <UInput
            v-model.number="state.cantidadRequerida"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Unidad Componente" name="idUnidadComponente">
          <UInputMenu
            v-model="state.idUnidadComponente"
            :items="unidadesOptions"
            value-attribute="label"
            :loading="unidadesLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Observaciones" name="observaciones">
          <UTextarea v-model="state.observaciones" class="w-full" />
        </UFormField>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
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
