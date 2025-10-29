<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

// --- Query para productos ---
const ProductosQuery = gql`
  query ProductosOptions {
    productos {
      value: id
      label: nombre
    }
  }
`;

type ProductoOption = { value: string; label: string };
type ProductosResult = { productos: ProductoOption[] };

const { result } = useQuery<ProductosResult>(ProductosQuery);
const productosOptions = computed(() => result.value?.productos ?? []);

// --- Schema y estado ---
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

// --- Mutación ---
const CreateParametroMutation = gql`
  mutation createParametro($input: ParametroPlanificacionInput!) {
    createParametro(input: $input) {
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
            :items="productosOptions"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Lead time (días)" name="leadTimeDias">
          <UInput
            v-model.number="state.leadTimeDias"
            type="number"
            min="0"
            placeholder="Lead time"
          />
        </UFormField>
        <UFormField label="Lote mínimo" name="loteMinimo">
          <UInput
            v-model.number="state.loteMinimo"
            type="number"
            min="0"
            placeholder="Lote mínimo"
          />
        </UFormField>
        <UFormField label="Lote económico" name="loteEconomico">
          <UInput
            v-model.number="state.loteEconomico"
            type="number"
            min="0"
            placeholder="Lote económico"
          />
        </UFormField>
        <UFormField label="Política de inventario" name="politicaInventario">
          <UInput
            v-model="state.politicaInventario"
            placeholder="Ej: FIFO, LIFO, Just-in-time"
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
