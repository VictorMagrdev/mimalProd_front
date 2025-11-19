<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { z } from "zod";
import type { CreateTipoProductoResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoProductoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
});
type TipoProductoInput = z.infer<typeof TipoProductoSchema>;

const state = reactive<TipoProductoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
});

const CreateTipoProductoMutation = gql`
  mutation createTipoProducto($input: TipoProductoInput!) {
    createTipoProducto(input: $input) {
      id
    }
  }
`;
type CreateTipoProductoVars = { input: TipoProductoInput };
const { mutate } = useMutation<
  CreateTipoProductoResult,
  CreateTipoProductoVars
>(CreateTipoProductoMutation);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
}

async function onSubmit(event: FormSubmitEvent<TipoProductoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Tipo producto creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear tipo de producto">
    <UButton label="Nuevo tipo producto" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-tipo-producto"
        :schema="TipoProductoSchema"
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
        label="Crear tipo producto"
        type="submit"
        form="form-tipo-producto"
        color="neutral"
      />
    </template>
  </UModal>
</template>
