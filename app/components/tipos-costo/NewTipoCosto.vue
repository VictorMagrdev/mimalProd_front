<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { z } from "zod";
import type { CreateTipoCostoResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoCostoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
});
type TipoCostoInput = z.infer<typeof TipoCostoSchema>;

const state = reactive<TipoCostoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
  activo: true,
});

const CreateTipoCostoMutation = gql`
  mutation createTipoCosto($input: TipoCostoInput!) {
    createTipoCosto(input: $input) {
      id
    }
  }
`;
type CreateTipoCostoVars = { input: TipoCostoInput };
const { mutate } = useMutation<CreateTipoCostoResult, CreateTipoCostoVars>(
  CreateTipoCostoMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
  state.activo = true;
}

async function onSubmit(event: FormSubmitEvent<TipoCostoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Tipo costo creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear tipo de costo">
    <UButton label="Nuevo tipo costo" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-tipo-costo"
        :schema="TipoCostoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" />
        </UFormField>
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" />
        </UFormField>
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" />
        </UFormField>
        <UFormField label="Activo" name="activo">
          <UCheckbox v-model="state.activo" />
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
        label="Crear tipo costo"
        type="submit"
        form="form-tipo-costo"
        color="neutral"
      />
    </template>
  </UModal>
</template>
