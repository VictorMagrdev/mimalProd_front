<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  CreateProductoResult,
  ProductoOptionsResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const ProductoOptions = gql`
  query ProductoOptions {
    tiposProducto {
      value: id
      label: nombre
    }
    metodosValoracion {
      value: id
      label: nombre
    }
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<ProductoOptionsResult>(ProductoOptions);
const tipos = computed(() => result.value?.tiposProducto ?? []);
const metodos = computed(() => result.value?.metodosValoracion ?? []);
const unidades = computed(() => result.value?.unidadesMedida ?? []);

const ProductoSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  costoBase: z.number().optional(),
  tipoId: z.string().min(1),
  metodoValoracionId: z.string().min(1),
  unidadBaseId: z.string().min(1),
});
type ProductoInput = z.infer<typeof ProductoSchema>;

const state = reactive<ProductoInput>({
  codigo: "",
  nombre: "",
  costoBase: undefined,
  tipoId: "",
  metodoValoracionId: "",
  unidadBaseId: "",
});

const CreateProductoMutation = gql`
  mutation createProducto($input: ProductoInput!) {
    createProducto(input: $input) {
      id
    }
  }
`;
type CreateProductoVars = { input: ProductoInput };
const { mutate } = useMutation<CreateProductoResult, CreateProductoVars>(
  CreateProductoMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.costoBase = undefined;
  state.tipoId = "";
  state.metodoValoracionId = "";
  state.unidadBaseId = "";
}

async function onSubmit(event: FormSubmitEvent<ProductoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Producto creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear producto">
    <UButton label="Nuevo producto" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-producto"
        :schema="ProductoSchema"
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
        <UFormField label="Costo base" name="costoBase">
          <UInputNumber v-model="state.costoBase" />
        </UFormField>
        <UFormField label="Tipo" name="tipoId">
          <UInputMenu
            v-model="state.tipoId"
            value-key="value"
            :items="tipos"
            placeholder="Selecciona tipo"
          />
        </UFormField>
        <UFormField label="Método valoración" name="metodoValoracionId">
          <UInputMenu
            v-model="state.metodoValoracionId"
            value-key="value"
            :items="metodos"
            placeholder="Selecciona método"
          />
        </UFormField>
        <UFormField label="Unidad base" name="unidadBaseId">
          <UInputMenu
            v-model="state.unidadBaseId"
            value-key="value"
            :items="unidades"
            placeholder="Selecciona unidad"
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
        label="Crear producto"
        type="submit"
        form="form-producto"
        color="neutral"
      />
    </template>
  </UModal>
</template>
