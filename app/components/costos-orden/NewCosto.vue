<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { CostoOptionsResult, CreateCostoResult } from "~/utils/types";

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
      label: numeroOrden
    }
  }
`;
type CreateCostoVars = { input: CostoInput };

const { result } = useQuery<CostoOptionsResult>(CostoOptions);
const tipos = computed(() => result.value?.tiposCosto ?? []);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);

const CostoSchema = z.object({
  descripcion: z.string().min(1),
  monto: z.number(),
  moneda: z.string().min(1),
  ordenId: z.string().optional(),
  tipoCostoId: z.string().min(1),
});
type CostoInput = z.infer<typeof CostoSchema>;

const state = reactive<CostoInput>({
  descripcion: "",
  monto: 0,
  moneda: "",
  ordenId: undefined,
  tipoCostoId: "",
});

const CreateCostoMutation = gql`
  mutation createCostoOrden($input: CostoOrdenRequest!) {
    createCostoOrden(input: $input) {
      id
    }
  }
`;

const { mutate } = useMutation<CreateCostoResult, CreateCostoVars>(
  CreateCostoMutation,
);

function resetForm() {
  state.descripcion = "";
  state.monto = 0;
  state.moneda = "";
  state.ordenId = undefined;
  state.tipoCostoId = "";
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
          <UInput v-model="state.descripcion" class="w-full" />
        </UFormField>
        <UFormField label="Monto" name="monto">
          <UInputNumber v-model="state.monto" class="w-full" />
        </UFormField>
        <UFormField label="Moneda" name="moneda">
          <UInput v-model="state.moneda" class="w-full" />
        </UFormField>
        <UFormField label="Orden" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tipo costo" name="tipoCostoId">
          <UInputMenu
            v-model="state.tipoCostoId"
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
        label="Crear costo"
        type="submit"
        form="form-costo"
        color="neutral"
      />
    </template>
  </UModal>
</template>
