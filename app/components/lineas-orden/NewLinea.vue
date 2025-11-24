<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { LineaOptionsResult, CreateLineaResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const LineaOptions = gql`
  query LineaOrdenOptions {
    productos {
      value: id
      label: nombre
    }
    unidadesMedida {
      value: id
      label: nombre
    }
    ordenesProduccion {
      value: id
      label: numeroOrden
    }
  }
`;

const { result } = useQuery<LineaOptionsResult>(LineaOptions);
const productos = computed(() => result.value?.productos ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);
const ordenesProduccion = computed(() => result.value?.ordenesProduccion ?? []);
const LineaSchema = z.object({
  numeroLinea: z.number().optional(),
  cantidadRequerida: z.number().min(0),
  cantidadUsada: z.number().min(0).optional(),
  costoUnitario: z.number().optional(),
  observaciones: z.string().optional(),
  ordenId: z.string().min(1).optional(),
  productoComponenteId: z.string().min(1),
  unidadComponenteId: z.string().min(1),
});
type LineaInput = z.infer<typeof LineaSchema>;

const state = reactive<LineaInput>({
  numeroLinea: undefined,
  cantidadRequerida: 0,
  cantidadUsada: undefined,
  costoUnitario: undefined,
  observaciones: undefined,
  ordenId: undefined,
  productoComponenteId: "",
  unidadComponenteId: "",
});

const CreateLineaMutation = gql`
  mutation createLineaOrden($input: LineaOrdenRequest!) {
    createLineaOrden(input: $input) {
      id
    }
  }
`;
type CreateLineaVars = { input: LineaInput };
const { mutate } = useMutation<CreateLineaResult, CreateLineaVars>(
  CreateLineaMutation,
);

function resetForm() {
  state.numeroLinea = undefined;
  state.cantidadRequerida = 0;
  state.cantidadUsada = undefined;
  state.costoUnitario = undefined;
  state.observaciones = undefined;
  state.ordenId = undefined;
  state.productoComponenteId = "";
  state.unidadComponenteId = "";
}

async function onSubmit(event: FormSubmitEvent<LineaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Línea creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear línea de orden">
    <UButton label="Nueva línea" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-linea"
        :schema="LineaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Producto componente" name="productoComponenteId">
          <UInputMenu
            v-model="state.productoComponenteId"
            value-key="value"
            :items="productos"
            placeholder="Selecciona producto"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Unidad componente" name="unidadComponenteId">
          <UInputMenu
            v-model="state.unidadComponenteId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Orden de produccion" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            value-key="value"
            :items="ordenesProduccion"
            placeholder="Selecciona orden"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Cantidad requerida" name="cantidadRequerida">
          <UInputNumber v-model="state.cantidadRequerida" class="w-full" />
        </UFormField>
        <UFormField label="Cantidad usada" name="cantidadUsada">
          <UInputNumber v-model="state.cantidadUsada" class="w-full" />
        </UFormField>
        <UFormField label="Costo unitario" name="costoUnitario">
          <UInputNumber v-model="state.costoUnitario" class="w-full" />
        </UFormField>
        <UFormField label="Observaciones" name="observaciones">
          <UInput v-model="state.observaciones" class="w-full" />
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
        label="Crear línea"
        type="submit"
        form="form-linea"
        color="neutral"
      />
    </template>
  </UModal>
</template>
