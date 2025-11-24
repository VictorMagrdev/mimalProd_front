<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  ConversionOptionsResult,
  CreateConversionResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const query = gql`
  query GetUnidadesMedida {
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<ConversionOptionsResult>(query);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const ConversionSchema = z.object({
  factor: z.number().min(0),
  origenId: z.string().min(1),
  destinoId: z.string().min(1),
});
type ConversionInput = z.infer<typeof ConversionSchema>;

const state = reactive<ConversionInput>({
  factor: 1,
  origenId: "",
  destinoId: "",
});

const CreateConversionMutation = gql`
  mutation createUnidadConversion($input: UnidadConversionRequest!) {
    createUnidadConversion(input: $input) {
      id
    }
  }
`;
type CreateConversionVars = { input: ConversionInput };
const { mutate } = useMutation<CreateConversionResult, CreateConversionVars>(
  CreateConversionMutation,
);

function resetForm() {
  state.factor = 1;
  state.origenId = "";
  state.destinoId = "";
}

async function onSubmit(event: FormSubmitEvent<ConversionInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Unidad conversión creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear unidad de conversión">
    <UButton label="Nueva conversión" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-conversion"
        :schema="ConversionSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Origen" name="origenId">
          <UInputMenu
            v-model="state.origenId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad origen"
          />
        </UFormField>
        <UFormField label="Destino" name="destinoId">
          <UInputMenu
            v-model="state.destinoId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad destino"
          />
        </UFormField>
        <UFormField label="Factor" name="factor">
          <UInputNumber v-model="state.factor" />
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
        label="Crear conversión"
        type="submit"
        form="form-conversion"
        color="neutral"
      />
    </template>
  </UModal>
</template>
