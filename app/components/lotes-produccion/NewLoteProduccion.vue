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
const LoteSchema = z.object({
  numeroLote: z.string().min(1),
  fabricadoEn: dateField,
  venceEn: dateField,
  productoId: z.string().min(1),
});
type LoteInput = z.infer<typeof LoteSchema>;

const state = reactive<LoteInput>({
  numeroLote: "",
  fabricadoEn: undefined,
  venceEn: undefined,
  productoId: "",
});

const CreateLoteMutation = gql`
  mutation createLoteProduccion($input: LoteProduccionRequest!) {
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
  state.numeroLote = "";
  state.fabricadoEn = undefined;
  state.venceEn = undefined;
  state.productoId = "";
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
        <UFormField label="Número de lote" name="numeroLote">
          <UInput v-model="state.numeroLote" class="w-full" />
        </UFormField>
        <UFormField label="Producto" name="productoId">
          <UInputMenu
            v-model="state.productoId"
            value-key="value"
            :items="productos"
            placeholder="Selecciona producto"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Fabricado en" name="fabricadoEn">
          <UInputDate v-model="state.fabricadoEn" class="w-full" />
        </UFormField>
        <UFormField label="Vence en" name="venceEn">
          <UInputDate v-model="state.venceEn" class="w-full" />
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
