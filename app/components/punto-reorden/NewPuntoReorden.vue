<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { CreatePuntoResult, PuntoOptionsResult } from "~/utils/types";

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

const { result } = useQuery<PuntoOptionsResult>(PuntoOptions);
const productos = computed(() => result.value?.productos ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const PuntoSchema = z.object({
  stockMinimo: z.number().min(0),
  stockSeguridad: z.number().min(0),
  productoId: z.string().min(1),
  unidadId: z.string().min(1),
});
type PuntoInput = z.infer<typeof PuntoSchema>;

const state = reactive<PuntoInput>({
  stockMinimo: 0,
  stockSeguridad: 0,
  productoId: "",
  unidadId: "",
});

const CreatePuntoMutation = gql`
  mutation createPuntoReorden($input: PuntoReordenRequest!) {
    createPuntoReorden(input: $input) {
      id
    }
  }
`;
type CreatePuntoVars = { input: PuntoInput };
const { mutate } = useMutation<CreatePuntoResult, CreatePuntoVars>(
  CreatePuntoMutation,
);

function resetForm() {
  state.stockMinimo = 0;
  state.stockSeguridad = 0;
  state.productoId = "";
  state.unidadId = "";
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
        <UFormField label="Producto" name="productoId">
          <UInputMenu
            v-model="state.productoId"
            value-key="value"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidadId">
          <UInputMenu
            v-model="state.unidadId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Stock mínimo" name="stockMinimo">
          <UInputNumber v-model="state.stockMinimo" />
        </UFormField>
        <UFormField label="Stock seguridad" name="stockSeguridad">
          <UInputNumber v-model="state.stockSeguridad" />
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
