<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  CreateDiscResult,
  DiscrepanciaOptionsResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const DiscrepanciaOptions = gql`
  query DiscrepanciaInventarioOptions {
    conteosCiclico {
      value: id
      label: fecha
    }
  }
`;

const { result } = useQuery<DiscrepanciaOptionsResult>(DiscrepanciaOptions);
const conteos = computed(() => result.value?.conteosCiclico ?? []);

const DiscrepanciaSchema = z.object({
  cantidad_sistema: z.number(),
  resuelto: z.boolean(),
  conteo_id: z.string().min(1),
});
type DiscrepanciaInput = z.infer<typeof DiscrepanciaSchema>;

const state = reactive<DiscrepanciaInput>({
  cantidad_sistema: 0,
  resuelto: false,
  conteo_id: "",
});

const CreateDiscMutation = gql`
  mutation createDiscrepanciaInventario($input: DiscrepanciaInventarioInput!) {
    createDiscrepanciaInventario(input: $input) {
      id
    }
  }
`;

type CreateDiscVars = { input: DiscrepanciaInput };
const { mutate } = useMutation<CreateDiscResult, CreateDiscVars>(
  CreateDiscMutation,
);

function resetForm() {
  state.cantidad_sistema = 0;
  state.resuelto = false;
  state.conteo_id = "";
}

async function onSubmit(event: FormSubmitEvent<DiscrepanciaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Discrepancia creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear discrepancia de inventario">
    <UButton label="Nueva discrepancia" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-discrepancia"
        :schema="DiscrepanciaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Cantidad sistema" name="cantidad_sistema">
          <UInputNumber v-model="state.cantidad_sistema" />
        </UFormField>
        <UFormField label="Resuelto" name="resuelto">
          <UCheckbox v-model="state.resuelto" />
        </UFormField>
        <UFormField label="Conteo" name="conteo_id">
          <UInputMenu
            v-model="state.conteo_id"
            value-key="value"
            :items="conteos"
            placeholder="Selecciona conteo"
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
        label="Crear discrepancia"
        type="submit"
        form="form-discrepancia"
        color="neutral"
      />
    </template>
  </UModal>
</template>
