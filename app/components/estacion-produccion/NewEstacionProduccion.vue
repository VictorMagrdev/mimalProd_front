<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateEstacionProduccion from "~/graphql/inventario-lote/create-inventario-lote.graphql";
import ProductosLotesBodegasUnidades from "~/graphql/inventario-lote/get-productos-lotes-bodegas-unidades .graphql";
const open = ref(false);

interface EstacionProduccionFormState {
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

const EstacionProduccionSchemaInitialState: EstacionProduccionFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  orden: null!,
};

const state = reactive({ ...EstacionProduccionSchemaInitialState });
const error = ref<string | null>(null);

interface ProductosLotesBodegasUnidadesData {
  productos: { id: string; nombre: string }[];
}

const { result, refetch: refetchResult } =
  useQuery<ProductosLotesBodegasUnidadesData>(ProductosLotesBodegasUnidades);

const { unidadesMedida: unidades } = result.value ?? {
  unidadesMedida: [],
};

const unidadesOptions = computed(() =>
  unidades.map((u) => ({ label: u.nombre, value: u.id })),
);

watch(open, (isOpen) => {
  if (isOpen && unidadesOptions.value.length === 0) {
    refetchResult();
  }
});

function resetForm() {
  Object.assign(state, EstacionProduccionSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateEstacionProduccion);

async function onSubmit(event: FormSubmitEvent<EstacionProduccionFormState>) {
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
        id="estacionProduccionForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput
            v-model="state.codigo"
            class="w-full"
            placeholder="Código de la estación"
          />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            class="w-full"
            placeholder="Nombre de la estación"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UInput
            v-model="state.descripcion"
            class="w-full"
            placeholder="Descripción (opcional)"
          />
        </UFormField>

        <UFormField label="Orden" name="orden">
          <UInputMenu
            v-model="state.orden"
            :options="ordenOptions"
            value-key="value"
            label-key="label"
            class="w-full"
            placeholder="Seleccione el orden"
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
