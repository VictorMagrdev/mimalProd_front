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
  cantidadReservada: z.number().min(0),
  fechaReserva: z.string().min(1),
  ordenId: z.string().min(1),
  productoId: z.string().min(1),
  loteId: z.string().optional(),
  unidadId: z.string().min(1),
});
type ReservaInput = z.infer<typeof ReservaSchema>;

const state = reactive<ReservaInput>({
  cantidadReservada: 0,
  fechaReserva: "",
  ordenId: "",
  productoId: "",
  loteId: undefined,
  unidadId: "",
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
  state.cantidadReservada = 0;
  state.fechaReserva = "";
  state.ordenId = "";
  state.productoId = "";
  state.loteId = undefined;
  state.unidadId = "";
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
        <UFormField label="Orden" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
          />
        </UFormField>
        <UFormField label="Producto" name="productoId">
          <UInputMenu
            v-model="state.productoId"
            value-key="value"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Lote" name="loteId">
          <UInputMenu
            v-model="state.loteId"
            value-key="value"
            :items="lotes"
            placeholder="Selecciona lote"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidadId">
          <UInputMenu
            v-model="state.unidadId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Cantidad reservada" name="cantidadReservada">
          <UInputNumber v-model="state.cantidadReservada" />
        </UFormField>
        <UFormField label="Fecha reserva" name="fechaReserva">
          <UInput v-model="state.fechaReserva" placeholder="YYYY-MM-DD" />
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
