<script setup lang="ts">
import { reactive, ref } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const EstacionSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  orden: z.number().optional(),
});
type EstacionInput = z.infer<typeof EstacionSchema>;

const state = reactive<EstacionInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
  orden: undefined,
});

const CreateEstacionMutation = gql`
  mutation createEstacionProduccion($input: EstacionProduccionInput!) {
    createEstacionProduccion(input: $input) {
      id
    }
  }
`;
type CreateEstacionResult = { createEstacionProduccion: { id: string } };
type CreateEstacionVars = { input: EstacionInput };
const { mutate } = useMutation<CreateEstacionResult, CreateEstacionVars>(
  CreateEstacionMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
  state.orden = undefined;
}

async function onSubmit(event: FormSubmitEvent<EstacionInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Estación creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear estación de producción">
    <UButton label="Nueva estación" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-estacion"
        :schema="EstacionSchema"
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
        <UFormField label="Orden" name="orden">
          <UInputNumber v-model="state.orden" />
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
        label="Crear estación"
        type="submit"
        form="form-estacion"
        color="neutral"
      />
    </template>
  </UModal>
</template>
