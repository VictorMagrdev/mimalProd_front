<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  CreateMovimientoResult,
  MovimientoOptionsResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const MovimientoOptions = gql`
  query MovimientoInventarioOptions {
    bodegas {
      value: id
      label: nombre
    }
    tiposMovimiento {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<MovimientoOptionsResult>(MovimientoOptions);
const bodegas = computed(() => result.value?.bodegas ?? []);
const tipos = computed(() => result.value?.tiposMovimiento ?? []);
const dateField = z
  .any()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    if (value?.toDate) {
      return value.toDate().toISOString();
    }
    return value;
  });

const MovimientoSchema = z.object({
  fecha: dateField,
  referencia: z.string().optional(),
  observaciones: z.string().optional(),
  creadoPor: z.string().optional(),
  bodegaOrigenId: z.string().min(1).optional(),
  bodegaDestinoId: z.string().min(1).optional(),
  tipoMovimientoId: z.string().min(1),
});
type MovimientoInput = z.infer<typeof MovimientoSchema>;

const state = reactive<MovimientoInput>({
  fecha: "",
  referencia: undefined,
  observaciones: undefined,
  creadoPor: undefined,
  bodegaOrigenId: undefined,
  bodegaDestinoId: undefined,
  tipoMovimientoId: "",
});

const CreateMovimientoMutation = gql`
  mutation createMovimientoInventario($input: MovimientoInventarioRequest!) {
    createMovimientoInventario(input: $input) {
      id
    }
  }
`;
type CreateMovimientoVars = { input: MovimientoInput };
const { mutate } = useMutation<CreateMovimientoResult, CreateMovimientoVars>(
  CreateMovimientoMutation,
);

function resetForm() {
  state.fecha = "";
  state.referencia = undefined;
  state.observaciones = undefined;
  state.creadoPor = undefined;
  state.bodegaOrigenId = undefined;
  state.bodegaDestinoId = undefined;
  state.tipoMovimientoId = "";
}

async function onSubmit(event: FormSubmitEvent<MovimientoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Movimiento creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear movimiento de inventario">
    <UButton label="Nuevo movimiento" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-movimiento"
        :schema="MovimientoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Fecha" name="fecha">
          <UInputDate v-model="state.fecha" class="w-full" />
        </UFormField>
        <UFormField label="Referencia" name="referencia">
          <UInput v-model="state.referencia" class="w-full" />
        </UFormField>
        <UFormField label="Observaciones" name="observaciones">
          <UInput v-model="state.observaciones" class="w-full" />
        </UFormField>
        <UFormField label="Bodega origen" name="bodegaOrigenId">
          <UInputMenu
            v-model="state.bodegaOrigenId"
            value-key="value"
            :items="bodegas"
            placeholder="Selecciona bodega origen"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Bodega destino" name="bodegaDestinoId">
          <UInputMenu
            v-model="state.bodegaDestinoId"
            value-key="value"
            :items="bodegas"
            placeholder="Selecciona bodega destino"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tipo movimiento" name="tipoMovimientoId">
          <UInputMenu
            v-model="state.tipoMovimientoId"
            value-key="value"
            :items="tipos"
            placeholder="Selecciona tipo"
            class="w-full"
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
        label="Crear movimiento"
        type="submit"
        form="form-movimiento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
