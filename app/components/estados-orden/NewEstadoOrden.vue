<script setup lang="ts">
import { reactive, ref } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const EstadoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
});
type EstadoInput = z.infer<typeof EstadoSchema>;

const state = reactive<EstadoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
  activo: true,
});

const CreateEstadoMutation = gql`
  mutation createEstadoOrden($input: EstadoOrdenRequest!) {
    createEstadoOrden(input: $input) {
      id
    }
  }
`;
type CreateEstadoResult = { createEstadoOrden: { id: string } };
type CreateEstadoVars = { input: EstadoInput };
const { mutate } = useMutation<CreateEstadoResult, CreateEstadoVars>(
  CreateEstadoMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
  state.activo = true;
}

async function onSubmit(event: FormSubmitEvent<EstadoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Estado creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear estado de orden">
    <UButton label="Nuevo estado" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-estado"
        :schema="EstadoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" placeholder="Código" />
        </UFormField>
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" placeholder="Nombre" />
        </UFormField>
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" placeholder="Descripción" />
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
        label="Crear estado"
        type="submit"
        form="form-estado"
        color="neutral"
      />
    </template>
  </UModal>
</template>
