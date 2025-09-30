<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import CreateLoteProduccion from "~/graphql/lotes-produccion/create-lote-produccion.graphql";
import GetProductos from "~/graphql/productos/get-productos.graphql";

const emit = defineEmits<{ (e: "create"): void }>();

const open = ref(false);

interface Producto {
  id: string;
  nombre: string;
}

interface LoteProduccionFormState {
  numeroLote: string;
  idProducto?: string;
  fabricadoEn: string;
  venceEn: string;
}

const LoteSchemaInitialState: LoteProduccionFormState = {
  numeroLote: "",
  idProducto: undefined,
  fabricadoEn: "",
  venceEn: "",
};
const state = reactive({ ...LoteSchemaInitialState });

// Errores y notificaciones
const error = ref<string | null>(null);
const toast = useToast();

const {
  result: productosResult,
  loading: productosLoading,
  refetch: refetchProductos,
} = useQuery(GetProductos);

// Options tipados
const productosOptions = computed(() =>
  (productosResult.value?.productos || []).map((p: Producto) => ({
    label: p.nombre,
    id: p.id.toString(),
  })),
);

// Refetch productos al abrir modal
watch(open, (isOpen) => {
  if (isOpen) refetchProductos();
});

// Reset
function resetForm() {
  Object.assign(state, LoteSchemaInitialState);
}

// Mutación
const { mutate, loading } = useMutation(CreateLoteProduccion);

// Submit
async function onSubmit(event: FormSubmitEvent<LoteProduccionFormState>) {
  error.value = null;
  try {
    await mutate({ input: event.data });

    toast.add({
      title: "Lote creado",
      description: "El lote de producción fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear lote de producción">
    <template #description>
      Completa el formulario para registrar un nuevo lote de producción.
    </template>
    <UButton
      label="Nuevo lote"
      color="neutral"
      variant="subtle"
      @click="open = true"
    />
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm id="loteForm" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Número de Lote" name="numeroLote">
          <UInput
            v-model="state.numeroLote"
            class="w-full"
            placeholder="Número del lote"
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

        <UFormField label="Fabricado En" name="fabricadoEn">
          <UInput v-model="state.fabricadoEn" class="w-full" type="date" />
        </UFormField>

        <UFormField label="Vence En" name="venceEn">
          <UInput v-model="state.venceEn" class="w-full" type="date" />
        </UFormField>

        <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
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
            open = false;
            resetForm();
          }
        "
      />
      <UButton
        label="Crear lote"
        type="submit"
        color="neutral"
        form="loteForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
