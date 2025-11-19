<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { LoteOptionsResult, OrdenOptionsResult } from "~/utils/types";

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

const OrdenesQuery = gql`
  query OrdenesProduccionOptions {
    ordenesProduccion {
      value: id
      label: codigo
    }
  }
`;

const { result: productosResult } = useQuery<LoteOptionsResult>(ProductosQuery);
const { result: ordenesResult } = useQuery<OrdenOptionsResult>(OrdenesQuery);

const productosOptions = computed(() => productosResult.value?.productos ?? []);
const ordenesOptions = computed(
  () => ordenesResult.value?.ordenesProduccion ?? [],
);

const RequerimientoSchema = z.object({
  productoId: z.string().min(1),
  ordenProduccionId: z.string().optional(),
  cantidadRequerida: z.number().min(0.01),
  cantidadDisponible: z.number().optional(),
  fechaNecesidad: z.string().optional(),
});
type RequerimientoInput = z.infer<typeof RequerimientoSchema>;

const state = reactive<RequerimientoInput>({
  productoId: "",
  ordenProduccionId: "",
  cantidadRequerida: 0,
  cantidadDisponible: 0,
  fechaNecesidad: "",
});

// --- Mutación ---
const CreateRequerimientoMutation = gql`
  mutation createRequerimiento($input: RequerimientoMaterialInput!) {
    createRequerimiento(input: $input) {
      id
    }
  }
`;

const { mutate } = useMutation(CreateRequerimientoMutation);

function resetForm() {
  state.productoId = "";
  state.ordenProduccionId = "";
  state.cantidadRequerida = 0;
  state.cantidadDisponible = 0;
  state.fechaNecesidad = "";
}

async function onSubmit(event: FormSubmitEvent<RequerimientoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Requerimiento creado", color: "success" });
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
  <UModal v-model:open="open" title="Crear requerimiento de material">
    <UButton label="Nuevo requerimiento" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-requerimiento"
        :schema="RequerimientoSchema"
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
        <UFormField label="Orden de Producción" name="ordenProduccionId">
          <UInputMenu
            v-model="state.ordenProduccionId"
            :items="ordenesOptions"
            placeholder="Selecciona orden (opcional)"
          />
        </UFormField>
        <UFormField label="Cantidad requerida" name="cantidadRequerida">
          <UInput
            v-model.number="state.cantidadRequerida"
            type="number"
            min="0"
            placeholder="Cantidad requerida"
          />
        </UFormField>
        <UFormField label="Cantidad disponible" name="cantidadDisponible">
          <UInput
            v-model.number="state.cantidadDisponible"
            type="number"
            min="0"
            placeholder="Cantidad disponible"
          />
        </UFormField>
        <UFormField label="Fecha de necesidad" name="fechaNecesidad">
          <UInput v-model="state.fechaNecesidad" type="date" />
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
        label="Crear requerimiento"
        type="submit"
        form="form-requerimiento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
