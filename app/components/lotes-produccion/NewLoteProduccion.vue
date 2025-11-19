<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { CreateLoteResult, LoteOptionsResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const LoteOptions = gql`
  query LoteProduccionOptions {
    productos {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<LoteOptionsResult>(LoteOptions);
const productos = computed(() => result.value?.productos ?? []);

const LoteSchema = z.object({
  numero_lote: z.string().min(1),
  fabricado_en: z.string().optional(),
  vence_en: z.string().optional(),
  producto_id: z.string().min(1),
});
type LoteInput = z.infer<typeof LoteSchema>;

const state = reactive<LoteInput>({
  numero_lote: "",
  fabricado_en: undefined,
  vence_en: undefined,
  producto_id: "",
});

const CreateLoteMutation = gql`
  mutation createLoteProduccion($input: LoteProduccionInput!) {
    createLoteProduccion(input: $input) {
      id
    }
  }
`;

type CreateLoteVars = { input: LoteInput };
const { mutate } = useMutation<CreateLoteResult, CreateLoteVars>(
  CreateLoteMutation,
);

function resetForm() {
  state.numero_lote = "";
  state.fabricado_en = undefined;
  state.vence_en = undefined;
  state.producto_id = "";
}

async function onSubmit(event: FormSubmitEvent<LoteInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Lote creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear lote de producción">
    <UButton label="Nuevo lote" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-lote"
        :schema="LoteSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Número de lote" name="numero_lote">
          <UInput v-model="state.numero_lote" />
        </UFormField>
        <UFormField label="Producto" name="producto_id">
          <UInputMenu
            v-model="state.producto_id"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Fabricado en" name="fabricado_en">
          <UInput v-model="state.fabricado_en" placeholder="YYYY-MM-DD" />
        </UFormField>
        <UFormField label="Vence en" name="vence_en">
          <UInput v-model="state.vence_en" placeholder="YYYY-MM-DD" />
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
        label="Crear lote"
        type="submit"
        form="form-lote"
        color="neutral"
      />
    </template>
  </UModal>
</template>
