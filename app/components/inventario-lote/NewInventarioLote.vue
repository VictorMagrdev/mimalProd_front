<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  InventarioOptionsResult,
  CreateInventarioResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const InventarioOptions = gql`
  query InventarioLoteOptions {
    productos {
      value: id
      label: nombre
    }
    lotesProduccion {
      value: id
      label: numeroLote
    }
    bodegas {
      value: id
      label: nombre
    }
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<InventarioOptionsResult>(InventarioOptions);
const productos = computed(() => result.value?.productos ?? []);
const lotes = computed(() => result.value?.lotesProduccion ?? []);
const bodegas = computed(() => result.value?.bodegas ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const InventarioSchema = z.object({
  cantidad: z.number().min(0),
  loteId: z.string().min(1),
  bodegaId: z.string().min(1),
  productoId: z.string().min(1),
  unidadId: z.string().min(1),
});
type InventarioInput = z.infer<typeof InventarioSchema>;

const state = reactive<InventarioInput>({
  cantidad: 0,
  loteId: "",
  bodegaId: "",
  productoId: "",
  unidadId: "",
});

const CreateInventarioMutation = gql`
  mutation createInventarioLote($input: InventarioLoteRequest!) {
    createInventarioLote(input: $input) {
      id
    }
  }
`;
type CreateInventarioVars = { input: InventarioInput };
const { mutate } = useMutation<CreateInventarioResult, CreateInventarioVars>(
  CreateInventarioMutation,
);

function resetForm() {
  state.cantidad = 0;
  state.loteId = "";
  state.bodegaId = "";
  state.productoId = "";
  state.unidadId = "";
}

async function onSubmit(event: FormSubmitEvent<InventarioInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Inventario creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear inventario por lote">
    <UButton label="Nuevo inventario" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-inventario"
        :schema="InventarioSchema"
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
            class="w-full"
          />
        </UFormField>
        <UFormField label="Lote" name="loteId">
          <UInputMenu
            v-model="state.loteId"
            value-key="value"
            :items="lotes"
            placeholder="Selecciona lote"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Bodega" name="bodegaId">
          <UInputMenu
            v-model="state.bodegaId"
            value-key="value"
            :items="bodegas"
            placeholder="Selecciona bodega"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidadId">
          <UInputMenu
            v-model="state.unidadId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Cantidad" name="cantidad">
          <UInputNumber v-model="state.cantidad" class="w-full" />
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
        label="Crear inventario"
        type="submit"
        form="form-inventario"
        color="neutral"
      />
    </template>
  </UModal>
</template>
