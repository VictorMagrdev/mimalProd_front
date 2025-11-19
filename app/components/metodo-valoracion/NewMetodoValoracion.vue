<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { z } from "zod";
import type { CreateMetodoResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const MetodoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
});

type MetodoInput = z.infer<typeof MetodoSchema>;

const state = reactive<MetodoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
});

const CreateMetodoMutation = gql`
  mutation createMetodoValoracion($input: MetodoValoracionInput!) {
    createMetodoValoracion(input: $input) {
      id
    }
  }
`;

type CreateMetodoVars = { input: MetodoInput };
const { mutate } = useMutation<CreateMetodoResult, CreateMetodoVars>(
  CreateMetodoMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
}

async function onSubmit(event: FormSubmitEvent<MetodoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Método creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear método de valoración">
    <UButton label="Nuevo método" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-metodo"
        :schema="MetodoSchema"
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
        label="Crear método"
        type="submit"
        form="form-metodo"
        color="neutral"
      />
    </template>
  </UModal>
</template>
