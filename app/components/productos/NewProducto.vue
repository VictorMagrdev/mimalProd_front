<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed, watch } from "vue";
import createProducto from "~/graphql/productos/create-producto.graphql";
import getUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const emit = defineEmits<{ (e: "create"): void }>();
const open = ref(false);

interface ProductoFormState {
  codigo: string;
  nombre: string;
  idUnidadBase?: string;
  costoBase?: number;
}

const ProductoSchemaInitialState: ProductoFormState = {
  codigo: "",
  nombre: "",
  idUnidadBase: undefined,
  costoBase: 0,
};

const state = reactive({ ...ProductoSchemaInitialState });
const error = ref<string | null>(null);

interface UnidadMedida {
  id: string;
  nombre: string;
}

interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

const {
  result: unidadesResult,
  loading: unidadesLoading,
  refetch: refetchUnidades,
} = useQuery<UnidadesMedidaResult>(getUnidadesMedida);

const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      label: u.nombre,
      value: u.id,
    })) ?? [],
);

watch(open, (isOpen) => {
  if (isOpen && unidadesOptions.value.length === 0) {
    refetchUnidades();
  }
});

function resetForm() {
  Object.assign(state, ProductoSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(createProducto);

async function onSubmit(event: FormSubmitEvent<ProductoFormState>) {
  error.value = null;

  try {
    const input = {
      ...event.data,
      costoBase: Number(event.data.costoBase),
      idUnidadBase: event.data.idUnidadBase
        ? String(event.data.idUnidadBase)
        : undefined,
    };

    await mutate({ input });

    toast.add({
      title: "Producto creado",
      description: "El producto fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear producto">
    <template #description>
      Completa el formulario para registrar un nuevo producto.
    </template>

    <UButton
      class="right-0"
      label="Nuevo producto"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="productoForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código del producto"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre del producto"
          />
        </UFormField>

        <UFormField label="Costo Base" name="costoBase">
          <UInput
            v-model.number="state.costoBase"
            class="w-full"
            type="number"
            placeholder="0.00"
          />
        </UFormField>

        <UFormField label="Unidad Base" name="idUnidadBase">
          <UInputMenu
            v-model="state.idUnidadBase"
            :items="unidadesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            :loading="unidadesLoading"
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
        label="Crear producto"
        type="submit"
        color="neutral"
        form="productoForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
