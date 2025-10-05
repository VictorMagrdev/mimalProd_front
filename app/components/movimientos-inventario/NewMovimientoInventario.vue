<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, computed } from "vue";

import CreateMovimientoInventario from "~/graphql/movimientos-inventario/create-movimientos-inventario.graphql";

const MovimientoInventarioFormOptions = gql`
  query MovimientoInventarioFormOptions {
    bodegas: bodegas {
      value: id
      label: nombre
    }
    tiposMovimiento: tiposMovimiento {
      value: id
      label: nombre
    }
    productos: productos {
      value: id
      label: nombre
      codigo
    }
    lotes: lotesProduccion {
      value: id
      label: numero_lote
      producto_id: producto_id
    }
    unidadesMedida: unidadesMedida {
      value: id
      label: nombre
      abreviatura
    }
  }
`;

// Emits
const emit = defineEmits<{ 
  (e: "create"): void;
}>();

const open = ref(false);

interface MovimientoInventarioDetalle {
  producto_id: string;
  lote_id: string;
  cantidad: number | null;
  unidad_id: string;
  costo_unitario: number | null;
  costo_total: number | null;
}

interface MovimientoInventarioFormState {
  fecha: Date;
  bodega_origen_id: string;
  bodega_destino_id: string;
  tipo_movimiento_id: string;
  referencia: string;
  observaciones: string;
  creado_por: string;
  detalles: MovimientoInventarioDetalle[];
}
const { result, loading: optionsLoading, refetch } = useQuery(
  MovimientoInventarioFormOptions,
  {}
);

// Cargar opciones cuando se abre el modal
watch(open, (isOpen) => {
  if (isOpen) {
    refetch()?.catch((err) => {
      console.error("Error cargando opciones:", err);
      toast.add({
        title: "Error",
        description: "No se pudieron cargar las opciones del formulario",
        color: "error",
      });
    });
  }
});

// Ya no necesitamos mapear - los datos vienen en el formato correcto
const bodegaOptions = computed(() => result.value?.bodegas ?? []);
const tipoMovimientoOptions = computed(() => result.value?.tiposMovimiento ?? []);
const productoOptions = computed(() => 
  result.value?.productos?.map(p => ({
    ...p,
    label: `${p.codigo} - ${p.label}`
  })) ?? []
);
const unidadMedidaOptions = computed(() => 
  result.value?.unidadesMedida?.map(u => ({
    ...u,
    label: `${u.label} (${u.abreviatura})`
  })) ?? []
);

const lotesPorProducto = computed(() => {
  const detallesConProducto = state.detalles.filter(d => d.producto_id);
  if (detallesConProducto.length === 0) return [];
  
  return result.value?.lotes?.filter(lote => 
    detallesConProducto.some(detalle => detalle.producto_id === lote.producto_id)
  ) ?? [];
});

const initialState: MovimientoInventarioFormState = {
  fecha: new Date(),
  bodega_origen_id: "",
  bodega_destino_id: "",
  tipo_movimiento_id: "",
  referencia: "",
  observaciones: "",
  creado_por: "1",
  detalles: [{
    producto_id: "",
    lote_id: "",
    cantidad: null,
    unidad_id: "",
    costo_unitario: null,
    costo_total: null,
  }],
};

const state = reactive<MovimientoInventarioFormState>({ ...initialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, { ...initialState });
}

function agregarDetalle() {
  state.detalles.push({
    producto_id: "",
    lote_id: "",
    cantidad: null,
    unidad_id: "",
    costo_unitario: null,
    costo_total: null,
  });
}

// Función para eliminar detalle
function eliminarDetalle(index: number) {
  if (state.detalles.length > 1) {
    state.detalles.splice(index, 1);
  }
}

// Calcular costo total automáticamente
watch(() => state.detalles, (detalles) => {
  detalles.forEach(detalle => {
    if (detalle.cantidad && detalle.costo_unitario) {
      detalle.costo_total = detalle.cantidad * detalle.costo_unitario;
    } else {
      detalle.costo_total = null;
    }
  });
}, { deep: true });

const toast = useToast();
const { mutate, loading: submitLoading } = useMutation(CreateMovimientoInventario);

async function onSubmit(event: FormSubmitEvent<MovimientoInventarioFormState>) {
  error.value = null;
  
  try {
    const detallesValidos = event.data.detalles.filter(d => 
      d.producto_id && d.cantidad && d.unidad_id
    );
    
    if (detallesValidos.length === 0) {
      throw new Error("Debe agregar al menos un producto al movimiento");
    }

    const input = {
      ...event.data,
      detalles: detallesValidos,
      fecha: event.data.fecha ? new Date(event.data.fecha).toISOString() : new Date().toISOString(),
    };

    await mutate({ input });
    
    emit("create");
    toast.add({
      title: "Movimiento creado",
      description: "El movimiento de inventario fue registrado correctamente",
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 3000,
    });

    resetForm();
    open.value = false;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Error desconocido";
    error.value = errorMessage;
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 5000,
    });
  }
}

const loading = computed(() => optionsLoading.value || submitLoading.value);
</script>

<template>
  <UModal 
    v-model:open="open" 
    title="Crear Movimiento de Inventario"
    :ui="{ 
      content: 'max-w-4xl',
      body: 'max-h-[70vh] overflow-y-auto'
    }"
  >
    <UButton
      label="Nuevo Movimiento"
      icon="i-lucide-plus"
      color="primary"
      @click="open = true"
    />

    <template #description>
      Complete el formulario para registrar un nuevo movimiento de inventario. 
      Asegúrese de agregar los productos involucrados en la sección de detalles.
    </template>

    <template #body>
      <div v-if="optionsLoading" class="flex justify-center py-8">
        <ULoadingIcon class="w-8 h-8" />
      </div>

      <UForm
        v-else
        id="movimientoInventarioForm"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <!-- Información general del movimiento -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Fecha" name="fecha" required>
            <UInput
              v-model="state.fecha"
              type="date"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Tipo de Movimiento" name="tipo_movimiento_id" required>
            <USelect
              v-model="state.tipo_movimiento_id"
              :items="tipoMovimientoOptions"
              placeholder="Seleccione tipo de movimiento"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Bodega Origen" name="bodega_origen_id" required>
            <USelect
              v-model="state.bodega_origen_id"
              :items="bodegaOptions"
              placeholder="Seleccione bodega origen"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Bodega Destino" name="bodega_destino_id" required>
            <USelect
              v-model="state.bodega_destino_id"
              :items="bodegaOptions"
              placeholder="Seleccione bodega destino"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Información adicional -->
        <UFormField label="Referencia" name="referencia">
          <UInput
            v-model="state.referencia"
            placeholder="Número de referencia o documento"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Observaciones" name="observaciones">
          <UTextarea
            v-model="state.observaciones"
            placeholder="Observaciones adicionales del movimiento"
            class="w-full"
            :rows="3"
          />
        </UFormField>

        <!-- Sección de detalles del movimiento -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Detalles del Movimiento</h3>
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="outline"
              @click="agregarDetalle"
            >
              Agregar Producto
            </UButton>
          </div>

          <div v-for="(detalle, index) in state.detalles" :key="index" class="space-y-4 p-4 border rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-gray-700">Producto {{ index + 1 }}</h4>
              <UButton
                v-if="state.detalles.length > 1"
                icon="i-lucide-trash-2"
                color="red"
                variant="ghost"
                size="sm"
                @click="eliminarDetalle(index)"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <UFormField :label="index === 0 ? 'Producto' : ''" :name="`detalles[${index}].producto_id`" required>
                <USelect
                  v-model="detalle.producto_id"
                  :items="productoOptions"
                  placeholder="Seleccione producto"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="index === 0 ? 'Lote' : ''" :name="`detalles[${index}].lote_id`">
                <USelect
                  v-model="detalle.lote_id"
                  :items="lotesPorProducto"
                  placeholder="Seleccione lote"
                  class="w-full"
                  :disabled="!detalle.producto_id"
                />
              </UFormField>

              <UFormField :label="index === 0 ? 'Cantidad' : ''" :name="`detalles[${index}].cantidad`" required>
                <UInputNumber
                  v-model="detalle.cantidad"
                  placeholder="Cantidad"
                  class="w-full"
                  :min="0.01"
                  :step="0.01"
                />
              </UFormField>

              <UFormField :label="index === 0 ? 'Unidad' : ''" :name="`detalles[${index}].unidad_id`" required>
                <USelect
                  v-model="detalle.unidad_id"
                  :items="unidadMedidaOptions"
                  placeholder="Seleccione unidad"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="index === 0 ? 'Costo Unitario' : ''" :name="`detalles[${index}].costo_unitario`">
                <UInputNumber
                  v-model="detalle.costo_unitario"
                  placeholder="Costo unitario"
                  class="w-full"
                  :min="0"
                  :step="0.01"
                />
              </UFormField>

              <UFormField :label="index === 0 ? 'Costo Total' : ''" :name="`detalles[${index}].costo_total`">
                <UInputNumber
                  v-model="detalle.costo_total"
                  placeholder="Costo total"
                  class="w-full"
                  readonly
                  :ui="{ base: 'bg-gray-50' }"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
            <span class="font-medium">Error</span>
          </div>
          <p class="text-red-600 text-sm mt-1">{{ error }}</p>
        </div>
      </UForm>
    </template>

    <!-- Footer del modal -->
    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        :disabled="loading"
        @click="
          () => {
            close();
            resetForm();
          }
        "
      />
      <UButton
        label="Crear Movimiento"
        type="submit"
        color="primary"
        :loading="loading"
        :disabled="loading"
        form="movimientoInventarioForm"
      />
    </template>
  </UModal>
</template>