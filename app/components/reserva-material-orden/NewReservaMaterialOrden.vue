<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { CreateReservaResult, ReservaOptionsResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const ReservaOptions = gql`
  query ReservaMaterialOrdenOptions {
    ordenesProduccion {
      value: id
      label: numero_orden
    }
    productos {
      value: id
      label: nombre
    }
    lotesProduccion {
      value: id
      label: numero_lote
    }
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<ReservaOptionsResult>(ReservaOptions);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);
const productos = computed(() => result.value?.productos ?? []);
const lotes = computed(() => result.value?.lotesProduccion ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const ReservaSchema = z.object({
  cantidad_reservada: z.number().min(0),
  fecha_reserva: z.string().min(1),
  orden_id: z.string().min(1),
  producto_id: z.string().min(1),
  lote_id: z.string().optional(),
  unidad_id: z.string().min(1),
});
type ReservaInput = z.infer<typeof ReservaSchema>;

const state = reactive<ReservaInput>({
  cantidad_reservada: 0,
  fecha_reserva: "",
  orden_id: "",
  producto_id: "",
  lote_id: undefined,
  unidad_id: "",
});

const CreateReservaMutation = gql`
  mutation createReservaMaterialOrden($input: ReservaMaterialOrdenInput!) {
    createReservaMaterialOrden(input: $input) {
      id
    }
  }
`;
type CreateReservaVars = { input: ReservaInput };
const { mutate } = useMutation<CreateReservaResult, CreateReservaVars>(
  CreateReservaMutation,
);

function resetForm() {
  state.cantidad_reservada = 0;
  state.fecha_reserva = "";
  state.orden_id = "";
  state.producto_id = "";
  state.lote_id = undefined;
  state.unidad_id = "";
}

async function onSubmit(event: FormSubmitEvent<ReservaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Reserva creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear reserva material">
    <UButton label="Nueva reserva" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-reserva"
        :schema="ReservaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden" name="orden_id">
          <UInputMenu
            v-model="state.orden_id"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
          />
        </UFormField>
        <UFormField label="Producto" name="producto_id">
          <UInputMenu
            v-model="state.producto_id"
            value-key="value"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Lote" name="lote_id">
          <UInputMenu
            v-model="state.lote_id"
            value-key="value"
            :items="lotes"
            placeholder="Selecciona lote"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidad_id">
          <UInputMenu
            v-model="state.unidad_id"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Cantidad reservada" name="cantidad_reservada">
          <UInputNumber v-model="state.cantidad_reservada" />
        </UFormField>
        <UFormField label="Fecha reserva" name="fecha_reserva">
          <UInput v-model="state.fecha_reserva" placeholder="YYYY-MM-DD" />
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
        label="Crear reserva"
        type="submit"
        form="form-reserva"
        color="neutral"
      />
    </template>
  </UModal>
</template>
