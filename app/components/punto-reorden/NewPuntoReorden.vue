<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const PuntoOptions = gql`
  query PuntoReordenOptions {
    productos {
      value: id
      label: nombre
    }
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;
type PuntoOptionsResult = {
  productos: { value: string; label: string }[];
  unidadesMedida: { value: string; label: string }[];
};
const { result } = useQuery<PuntoOptionsResult>(PuntoOptions);
const productos = computed(() => result.value?.productos ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const PuntoSchema = z.object({
  stock_minimo: z.number().min(0),
  stock_seguridad: z.number().min(0),
  producto_id: z.string().min(1),
  unidad_id: z.string().min(1),
});
type PuntoInput = z.infer<typeof PuntoSchema>;

const state = reactive<PuntoInput>({
  stock_minimo: 0,
  stock_seguridad: 0,
  producto_id: "",
  unidad_id: "",
});

const CreatePuntoMutation = gql`
  mutation createPuntoReorden($input: PuntoReordenInput!) {
    createPuntoReorden(input: $input) {
      id
    }
  }
`;
type CreatePuntoResult = { createPuntoReorden: { id: string } };
type CreatePuntoVars = { input: PuntoInput };
const { mutate } = useMutation<CreatePuntoResult, CreatePuntoVars>(
  CreatePuntoMutation,
);

function resetForm() {
  state.stock_minimo = 0;
  state.stock_seguridad = 0;
  state.producto_id = "";
  state.unidad_id = "";
}

async function onSubmit(event: FormSubmitEvent<PuntoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Punto reorden creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear punto de reorden">
    <UButton label="Nuevo punto" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-punto"
        :schema="PuntoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Producto" name="producto_id">
          <UInputMenu
            v-model="state.producto_id"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidad_id">
          <UInputMenu
            v-model="state.unidad_id"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Stock mínimo" name="stock_minimo">
          <UInputNumber v-model="state.stock_minimo" />
        </UFormField>
        <UFormField label="Stock seguridad" name="stock_seguridad">
          <UInputNumber v-model="state.stock_seguridad" />
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
        label="Crear punto"
        type="submit"
        form="form-punto"
        color="neutral"
      />
    </template>
  </UModal>
</template>
