<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const CostoOptions = gql`
  query CostoOrdenOptions {
    tiposCosto {
      value: id
      label: nombre
    }
    ordenesProduccion {
      value: id
      label: numero_orden
    }
  }
`;

type CostoOptionsResult = {
  tiposCosto: { value: string; label: string }[];
  ordenesProduccion: { value: string; label: string }[];
};
const { result } = useQuery<CostoOptionsResult>(CostoOptions);
const tipos = computed(() => result.value?.tiposCosto ?? []);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);

const CostoSchema = z.object({
  descripcion: z.string().min(1),
  monto: z.number(),
  moneda: z.string().min(1),
  registrado_en: z.string().min(1),
  orden_id: z.string().optional(),
  tipo_costo_id: z.string().min(1),
});
type CostoInput = z.infer<typeof CostoSchema>;

const state = reactive<CostoInput>({
  descripcion: "",
  monto: 0,
  moneda: "",
  registrado_en: "",
  orden_id: undefined,
  tipo_costo_id: "",
});

const CreateCostoMutation = gql`
  mutation createCostoOrden($input: CostoOrdenInput!) {
    createCostoOrden(input: $input) {
      id
    }
  }
`;

type CreateCostoResult = { createCostoOrden: { id: string } };
type CreateCostoVars = { input: CostoInput };
const { mutate } = useMutation<CreateCostoResult, CreateCostoVars>(
  CreateCostoMutation,
);

function resetForm() {
  state.descripcion = "";
  state.monto = 0;
  state.moneda = "";
  state.registrado_en = "";
  state.orden_id = undefined;
  state.tipo_costo_id = "";
}

async function onSubmit(event: FormSubmitEvent<CostoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Costo creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear costo orden">
    <UButton label="Nuevo costo" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-costo"
        :schema="CostoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" />
        </UFormField>
        <UFormField label="Monto" name="monto">
          <UInputNumber v-model="state.monto" />
        </UFormField>
        <UFormField label="Moneda" name="moneda">
          <UInput v-model="state.moneda" />
        </UFormField>
        <UFormField label="Registrado en" name="registrado_en">
          <UInput v-model="state.registrado_en" />
        </UFormField>
        <UFormField label="Orden" name="orden_id">
          <UInputMenu
            v-model="state.orden_id"
            :items="ordenes"
            placeholder="Selecciona orden"
          />
        </UFormField>
        <UFormField label="Tipo costo" name="tipo_costo_id">
          <UInputMenu
            v-model="state.tipo_costo_id"
            :items="tipos"
            placeholder="Selecciona tipo"
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
        label="Crear costo"
        type="submit"
        form="form-costo"
        color="neutral"
      />
    </template>
  </UModal>
</template>
