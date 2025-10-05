<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
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
  }
`;
type LineaOptionsResult = {
  productos: { value: string; label: string }[];
  unidadesMedida: { value: string; label: string }[];
};
const { result } = useQuery<LineaOptionsResult>(LineaOptions);
const productos = computed(() => result.value?.productos ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const LineaSchema = z.object({
  numero_linea: z.number().optional(),
  cantidad_requerida: z.number().min(0),
  cantidad_usada: z.number().min(0).optional(),
  costo_unitario: z.number().optional(),
  costo_total: z.number().optional(),
  observaciones: z.string().optional(),
  orden_id: z.string().min(1).optional(),
  producto_componente_id: z.string().min(1),
  unidad_componente_id: z.string().min(1),
});
type LineaInput = z.infer<typeof LineaSchema>;

const state = reactive<LineaInput>({
  numero_linea: undefined,
  cantidad_requerida: 0,
  cantidad_usada: undefined,
  costo_unitario: undefined,
  costo_total: undefined,
  observaciones: undefined,
  orden_id: undefined,
  producto_componente_id: "",
  unidad_componente_id: "",
});

const CreateLineaMutation = gql`
  mutation createLineaOrden($input: LineaOrdenInput!) {
    createLineaOrden(input: $input) {
      id
    }
  }
`;
type CreateLineaResult = { createLineaOrden: { id: string } };
type CreateLineaVars = { input: LineaInput };
const { mutate } = useMutation<CreateLineaResult, CreateLineaVars>(
  CreateLineaMutation,
);

function resetForm() {
  state.numero_linea = undefined;
  state.cantidad_requerida = 0;
  state.cantidad_usada = undefined;
  state.costo_unitario = undefined;
  state.costo_total = undefined;
  state.observaciones = undefined;
  state.orden_id = undefined;
  state.producto_componente_id = "";
  state.unidad_componente_id = "";
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
        <UFormField label="Producto componente" name="producto_componente_id">
          <UInputMenu
            v-model="state.producto_componente_id"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Unidad componente" name="unidad_componente_id">
          <UInputMenu
            v-model="state.unidad_componente_id"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Cantidad requerida" name="cantidad_requerida">
          <UInputNumber v-model="state.cantidad_requerida" />
        </UFormField>
        <UFormField label="Cantidad usada" name="cantidad_usada">
          <UInputNumber v-model="state.cantidad_usada" />
        </UFormField>
        <UFormField label="Costo unitario" name="costo_unitario">
          <UInputNumber v-model="state.costo_unitario" />
        </UFormField>
        <UFormField label="Costo total" name="costo_total">
          <UInputNumber v-model="state.costo_total" />
        </UFormField>
        <UFormField label="Observaciones" name="observaciones">
          <UInput v-model="state.observaciones" />
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
