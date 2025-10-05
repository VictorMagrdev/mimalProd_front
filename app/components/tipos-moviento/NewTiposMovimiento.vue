<script setup lang="ts">
import { reactive, ref } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoMovimientoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  afecta_wip: z.boolean().optional(),
});
type TipoMovimientoInput = z.infer<typeof TipoMovimientoSchema>;

const state = reactive<TipoMovimientoInput>({
  codigo: "",
  nombre: "",
  descripcion: undefined,
  afecta_wip: false,
});

const CreateTipoMovimientoMutation = gql`
  mutation createTipoMovimiento($input: TipoMovimientoInput!) {
    createTipoMovimiento(input: $input) {
      id
    }
  }
`;
type CreateTipoMovimientoResult = { createTipoMovimiento: { id: string } };
type CreateTipoMovimientoVars = { input: TipoMovimientoInput };
const { mutate } = useMutation<
  CreateTipoMovimientoResult,
  CreateTipoMovimientoVars
>(CreateTipoMovimientoMutation);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = undefined;
  state.afecta_wip = false;
}

async function onSubmit(event: FormSubmitEvent<TipoMovimientoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Tipo movimiento creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear tipo de movimiento">
    <UButton label="Nuevo tipo movimiento" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-tipo-movimiento"
        :schema="TipoMovimientoSchema"
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
        <UFormField label="Afecta WIP" name="afecta_wip">
          <UCheckbox v-model="state.afecta_wip" />
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
        label="Crear tipo movimiento"
        type="submit"
        form="form-tipo-movimiento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
