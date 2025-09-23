<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateInventarioLote from "~/graphql/inventario-lote/create-inventario-lote.graphql";
import ProductosLotesBodegasUnidades from "~/graphql/inventario-lote/get-productos-lotes-bodegas-unidades .graphql";
const open = ref(false);

interface InventarioLoteFormState {
  productoId: string;
  loteId?: string;
  bodegaId: string;
  cantidad: number;
  unidadId: string;
}

const InventarioLoteSchemaInitialState: InventarioLoteFormState = {
  productoId: "",
  loteId: "",
  bodegaId: "",
  cantidad: 0,
  unidadId: "",
};

const state = reactive({ ...InventarioLoteSchemaInitialState });
const error = ref<string | null>(null);

interface ProductosLotesBodegasUnidadesData {
  productos: { id: string; nombre: string }[];
  lotesProduccion: { id: string; numeroLote: string }[];
  bodegas: { id: string; nombre: string }[];
  unidadesMedida: { id: string; nombre: string }[];
}

  const { result, refetch: refetchResult } = useQuery<ProductosLotesBodegasUnidadesData>(ProductosLotesBodegasUnidades);

  const { productos, lotesProduccion: lotes, bodegas, unidadesMedida: unidades } = result.value ?? {
    productos: [],
    lotesProduccion: [],
    bodegas: [],
    unidadesMedida: [],
  };

const productosOptions = computed(() =>
    productos.map((p) => ({ label: p.nombre, value: p.id }))
  );

  const lotesOptions = computed(() =>
    lotes.map((l) => ({ label: l.numeroLote, value: l.id }))
  );

  const bodegasOptions = computed(() =>
    bodegas.map((b) => ({ label: b.nombre, value: b.id }))
  );

  const unidadesOptions = computed(() =>
    unidades.map((u) => ({ label: u.nombre, value: u.id }))
  );

watch(open, (isOpen) => {
  if (isOpen && unidadesOptions.value.length === 0) {
    refetchResult();
  }
});


function resetForm() {
  Object.assign(state, InventarioLoteSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateInventarioLote);

async function onSubmit(event: FormSubmitEvent<InventarioLoteFormState>) {
  error.value = null;

  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Tipo de costo creado",
      description: "El tipo de costo fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear tipo de costo">
    <template #description>
      Completa el formulario para registrar un nuevo tipo de costo.
    </template>

    <UButton
      class="right-0"
      label="Nuevo tipo de costo"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="tipoCostoForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
       <UFormField label="Producto" name="productoId">
          <UInputMenu
            v-model="state.productoId"
            :options="productosOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            searchable
          />
        </UFormField>

        <UFormField label="Lote" name="loteId">
          
          <UInputMenu
            v-model="state.loteId"
            :options="lotesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            searchable
          />
        </UFormField>

        <UFormField label="Bodega" name="bodegaId">
          <UInputMenu
            v-model="state.bodegaId"
            :options="bodegasOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            searchable
          />
        </UFormField>

        <UFormField label="Cantidad" name="cantidad">
          <UInput
            v-model="state.cantidad"
            type="number"
            class="w-full"
            placeholder="Cantidad en inventario"
          />
        </UFormField>

        <UFormField label="Unidad de Medida" name="unidadId">
          <UInputMenu
            v-model="state.unidadId"
            :options="unidadesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            searchable
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
        label="Crear tipo de costo"
        type="submit"
        color="neutral"
        form="tipoCostoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
