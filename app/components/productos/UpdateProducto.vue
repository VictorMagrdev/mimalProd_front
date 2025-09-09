<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import getProductoById from "~/graphql/productos/get-producto-by-id.graphql";
import updateProducto from "~/graphql/productos/update-producto.graphql";
import getUnidadesMedida from "~/graphql/unidades-medida/get-unidades-medida.graphql";

const props = defineProps<{
  open: boolean;
  productoId: string | null;
}>();
const emit = defineEmits<{ (e: "close"): void }>();

const error = ref<string | null>(null);

interface ProductoUpdateState {
  codigo: string;
  nombre: string;
  idUnidadBase?: string;
  costoBase?: number;
}

const state = reactive<ProductoUpdateState>({
  codigo: "",
  nombre: "",
  idUnidadBase: undefined,
  costoBase: 0,
});

interface UnidadMedida {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  costoBase?: number;
  unidadBase?: UnidadMedida;
}

interface ProductoResult {
  producto: Producto;
}

interface UnidadesMedidaResult {
  unidadesMedida: UnidadMedida[];
}

const { result: productoResult, loading: productoLoading } =
  useQuery<ProductoResult>(
    getProductoById,
    { id: computed(() => props.productoId) },
    { enabled: computed(() => !!props.productoId) },
  );
watch(productoResult, (newVal) => {
  if (newVal?.producto) {
    const p = newVal.producto as Producto;
    state.codigo = p.codigo;
    state.nombre = p.nombre;
    state.costoBase = p.costoBase ?? 0;
    state.idUnidadBase = p.unidadBase?.id;
  }
});

const {
  result: unidadesResult,
  loading: unidadesLoading,
  refetch: refetchUnidades,
} = useQuery<UnidadesMedidaResult>(getUnidadesMedida);

// Options tipados
const unidadesOptions = computed(
  () =>
    unidadesResult.value?.unidadesMedida.map((u) => ({
      label: u.nombre,
      value: u.id,
    })) ?? [],
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      refetchUnidades();
    }
  },
);

const toast = useToast();
const { mutate, loading: updateLoading } = useMutation(updateProducto);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.idUnidadBase = undefined;
  state.costoBase = 0;
}

async function onSubmit(event: FormSubmitEvent<ProductoUpdateState>) {
  error.value = null;

  if (!props.productoId) return;

  try {
    const input = {
      ...event.data,
      costoBase: Number(event.data.costoBase),
      idUnidadBase: event.data.idUnidadBase
        ? String(event.data.idUnidadBase)
        : undefined,
    };

    await mutate({ id: props.productoId, input });

    toast.add({
      title: "Producto actualizado",
      description: "El producto fue actualizado correctamente",
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
  <UModal :open="props.open" title="Actualizar producto" @close="emit('close')">
    <template #description>
      Modifica los campos para actualizar la información del producto.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <div v-if="productoLoading" class="text-center py-4">
        Cargando datos...
      </div>

      <UForm
        v-else
        id="updateProductoForm"
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
            :options="unidadesOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione una unidad"
            :loading="unidadesLoading"
            searchable
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
        form="updateProductoForm"
        :loading="updateLoading"
      />
    </template>
  </UModal>
</template>
