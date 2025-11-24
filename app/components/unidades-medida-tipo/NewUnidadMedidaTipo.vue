<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { z } from "zod";
import type { CreateTipoResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
});
type TipoInput = z.infer<typeof TipoSchema>;

const state = reactive<TipoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
});

const CreateTipoMutation = gql`
  mutation createUnidadMedidaTipo($input: UnidadMedidaTipoRequest!) {
    createUnidadMedidaTipo(input: $input) {
      id
    }
  }
`;
type CreateTipoVars = { input: TipoInput };
const { mutate } = useMutation<CreateTipoResult, CreateTipoVars>(
  CreateTipoMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
}

async function onSubmit(event: FormSubmitEvent<TipoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Tipo unidad creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear tipo unidad de medida">
    <UButton label="Nuevo tipo unidad" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-tipo-unidad"
        :schema="TipoSchema"
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
        label="Crear tipo unidad"
        type="submit"
        form="form-tipo-unidad"
        color="neutral"
      />
    </template>
  </UModal>
</template>
