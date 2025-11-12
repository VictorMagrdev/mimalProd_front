<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { InventarioOptionsResult, CreateInventarioResult } from "~/utils/types";
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
      label: numero_lote
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
  lote_id: z.string().min(1),
  bodega_id: z.string().min(1),
  producto_id: z.string().min(1),
  unidad_id: z.string().min(1),
  actualizado_en: z.string().optional(),
});
type InventarioInput = z.infer<typeof InventarioSchema>;

const state = reactive<InventarioInput>({
  cantidad: 0,
  lote_id: "",
  bodega_id: "",
  producto_id: "",
  unidad_id: "",
  actualizado_en: undefined,
});

const CreateInventarioMutation = gql`
  mutation createInventarioLote($input: InventarioLoteInput!) {
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
  state.lote_id = "";
  state.bodega_id = "";
  state.producto_id = "";
  state.unidad_id = "";
  state.actualizado_en = undefined;
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
        <UFormField label="Producto" name="producto_id">
          <UInputMenu
            v-model="state.producto_id"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Lote" name="lote_id">
          <UInputMenu
            v-model="state.lote_id"
            :items="lotes"
            placeholder="Selecciona lote"
          />
        </UFormField>
        <UFormField label="Bodega" name="bodega_id">
          <UInputMenu
            v-model="state.bodega_id"
            :items="bodegas"
            placeholder="Selecciona bodega"
          />
        </UFormField>
        <UFormField label="Unidad" name="unidad_id">
          <UInputMenu
            v-model="state.unidad_id"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Cantidad" name="cantidad">
          <UInputNumber v-model="state.cantidad" />
        </UFormField>
        <UFormField label="Actualizado en" name="actualizado_en">
          <UInput
            v-model="state.actualizado_en"
            placeholder="YYYY-MM-DDTHH:mm:ss"
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
        label="Crear inventario"
        type="submit"
        form="form-inventario"
        color="neutral"
      />
    </template>
  </UModal>
</template>
