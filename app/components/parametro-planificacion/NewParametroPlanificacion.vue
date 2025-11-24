<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { PuntoOptionsResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const ProductosQuery = gql`
  query ProductosOptions {
    productos {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<PuntoOptionsResult>(ProductosQuery);
const productosOptions = computed(() => result.value?.productos ?? []);

const ParametroSchema = z.object({
  productoId: z.string().min(1),
  leadTimeDias: z.number().min(0).optional(),
  loteMinimo: z.number().min(0).optional(),
  loteEconomico: z.number().min(0).optional(),
  politicaInventario: z.string().optional(),
});
type ParametroInput = z.infer<typeof ParametroSchema>;

const state = reactive<ParametroInput>({
  productoId: "",
  leadTimeDias: 0,
  loteMinimo: 0,
  loteEconomico: 0,
  politicaInventario: "",
});

const CreateParametroMutation = gql`
  mutation createParametro($input: ParametroPlanificacionRequest!) {
    createParametroPlanificacion(input: $input) {
      id
    }
  }
`;

const { mutate } = useMutation(CreateParametroMutation);

function resetForm() {
  state.productoId = "";
  state.leadTimeDias = 0;
  state.loteMinimo = 0;
  state.loteEconomico = 0;
  state.politicaInventario = "";
}

async function onSubmit(event: FormSubmitEvent<ParametroInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Parámetro creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({
      title: "Error al crear",
      description: String(e),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear parámetro de planificación">
    <UButton label="Nuevo parámetro" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-parametro"
        :schema="ParametroSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Producto" name="productoId">
          <UInputMenu
            v-model="state.productoId"
            value-key="value"
            :items="productosOptions"
            placeholder="Selecciona producto"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Lead time (días)" name="leadTimeDias">
          <UInput
            v-model.number="state.leadTimeDias"
            type="number"
            min="0"
            placeholder="Lead time"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Lote mínimo" name="loteMinimo">
          <UInput
            v-model.number="state.loteMinimo"
            type="number"
            min="0"
            placeholder="Lote mínimo"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Lote económico" name="loteEconomico">
          <UInput
            v-model.number="state.loteEconomico"
            type="number"
            min="0"
            placeholder="Lote económico"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Política de inventario" name="politicaInventario">
          <UInput
            v-model="state.politicaInventario"
            placeholder="Ej: FIFO, LIFO, Just-in-time"
            class="w-full"
          />
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
        label="Crear parámetro"
        type="submit"
        form="form-parametro"
        color="neutral"
      />
    </template>
  </UModal>
</template>
