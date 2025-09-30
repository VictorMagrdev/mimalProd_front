<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import CreateMovimientoInventario from "~/graphql/movimientos-inventario/create-movimientos-inventario.graphql";
import MovimientoInventarioFormOptions from "~/graphql/movimientos-inventario/MovimientoInventarioFormOptions .graphql";

const emit = defineEmits<{ (e: "create"): void }>();
const open = ref(false);
interface tiposMovimiento {
  id: string;
  nombre: string;
}
interface bodega {
  id: string;
  nombre: string;
}

interface MovimientoInventarioFormOptionsResult {
  bodegas: bodega[];
  tiposMovimiento: tiposMovimiento[];
}

const { result, refetch } = useQuery<MovimientoInventarioFormOptionsResult>(
  MovimientoInventarioFormOptions,
  {},
);
watch(open, (isOpen) => {
  if (isOpen) {
    refetch()?.catch((err) => {
      console.error("Error cargando opciones para movimiento inventario:", err);
    });
  }
});


// Mapear bodegas a opciones para selects
const bodegaOptions = computed(
  () =>
    result.value?.bodegas?.map((b) => ({
      label: b.nombre,
      value: b.id,
    })) ?? [],
);

// Mapear tipos de movimiento a opciones
const tipoMovimientoOptions = computed(
  () =>
    result.value?.tiposMovimiento?.map((tm) => ({
      label: tm.nombre,
      value: tm.id,
    })) ?? [],
);

interface MovimientoInventarioFormState {
  idBodegaOrigen: string | null;
  idBodegaDestino: string | null;
  idTipoMovimiento: string;
  referencia: string;
  observaciones: string;
  creadoPor: number | null;
}

const MovimientoInventarioSchemaInitialState: MovimientoInventarioFormState = {
  idBodegaOrigen: null,
  idBodegaDestino: null,
  idTipoMovimiento: "",
  referencia: "",
  observaciones: "",
  creadoPor: null,
};

const state = reactive({ ...MovimientoInventarioSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, MovimientoInventarioSchemaInitialState);
}

const toast = useToast();
const { mutate, loading } = useMutation(CreateMovimientoInventario);

async function onSubmit(event: FormSubmitEvent<MovimientoInventarioFormState>) {
  error.value = null;
  try {
    await mutate({ input: event.data });
    emit("create");
    toast.add({
      title: "Movimiento Inventario creado",
      description: "El movimiento Inventario fue registrado correctamente",
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
  <UModal v-model:open="open" title="Crear movimiento Inventario">
    <template #description>
      Completa el formulario para registrar un nuevo movimiento Inventario.
    </template>

    <UButton
      label="Nuevo movimiento"
      color="neutral"
      variant="subtle"
      @click="
        () => {
          open = true;
          refetch()?.catch((err) => {
            console.error(
              'Error cargando opciones para movimiento inventario:',
              err,
            );
          });
        }
      "
    />

    <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>

    <template #body>
      <UForm
        id="movimientoInventarioForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Bodega Origen" name="idBodegaOrigen">
          <UInputMenu
            v-model="state.idBodegaOrigen"
            value-key="value"
            :items="bodegaOptions"
            class="w-full"
            placeholder="Seleccione una bodega"
          />
        </UFormField>

        <UFormField label="Bodega Destino" name="idBodegaDestino">
          <UInputMenu
            v-model="state.idBodegaDestino"
            value-key="value"
            :items="bodegaOptions"
            class="w-full"
            placeholder="Seleccione una bodega"
          />
        </UFormField>

        <UFormField label="Tipo Movimiento" name="idTipoMovimiento">
          <UInputMenu
            v-model="state.idTipoMovimiento"
            :items="tipoMovimientoOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccione un tipo de movimiento"
          />
        </UFormField>

        <UFormField label="Referencia" name="referencia">
          <UInput
            v-model="state.referencia"
            class="w-full"
            placeholder="Referencia del movimiento"
          />
        </UFormField>

        <UFormField label="Observaciones" name="observaciones">
          <UInput
            v-model="state.observaciones"
            class="w-full"
            placeholder="Observaciones"
          />
        </UFormField>

        <UFormField label="Creado por (ID usuario)" name="creadoPor">
          <UInput
            v-model="state.creadoPor"
            type="number"
            class="w-full"
            placeholder="ID del usuario que crea el movimiento"
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
        label="Crear movimiento Inventario"
        type="submit"
        color="neutral"
        form="movimientoInventarioForm"
        :loading="loading"
      />
    </template>
  </UModal>
</template>
