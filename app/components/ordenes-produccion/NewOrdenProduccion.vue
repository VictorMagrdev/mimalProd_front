<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { CreateOrdenResult, OrdenProdOptionsResult } from "~/utils/types";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const OrdenProdOptions = gql`
  query OrdenProduccionOptions {
    unidadesMedida {
      value: id
      label: nombre
    }
    estadosOrden {
      value: id
      label: nombre
    }
    productos {
      value: id
      label: nombre
    }
  }
`;



const { result } = useQuery<OrdenProdOptionsResult>(OrdenProdOptions);
const unidades = computed(() => result.value?.unidadesMedida ?? []);
const estados = computed(() => result.value?.estadosOrden ?? []);
const productos = computed(() => result.value?.productos ?? []);

const OrdenSchema = z.object({
  numero_orden: z.string().min(1),
  cantidad: z.number().min(0),
  cantidad_producida: z.number().optional(),
  cantidad_desperdicio: z.number().optional(),
  inicio_planificado: z.string().optional(),
  fin_planificado: z.string().optional(),
  inicio_real: z.string().optional(),
  fin_real: z.string().optional(),
  observaciones: z.string().optional(),
  producto_id: z.string().min(1),
  unidad_id: z.string().min(1),
  estado_id: z.string().min(1),
});
type OrdenInput = z.infer<typeof OrdenSchema>;

const state = reactive<OrdenInput>({
  numero_orden: "",
  cantidad: 0,
  cantidad_producida: undefined,
  cantidad_desperdicio: undefined,
  inicio_planificado: undefined,
  fin_planificado: undefined,
  inicio_real: undefined,
  fin_real: undefined,
  observaciones: undefined,
  producto_id: "",
  unidad_id: "",
  estado_id: "",
});

const CreateOrdenMutation = gql`
  mutation createOrdenProduccion($input: OrdenProduccionInput!) {
    createOrdenProduccion(input: $input) {
      id
    }
  }
`;
type CreateOrdenVars = { input: OrdenInput };
const { mutate } = useMutation<CreateOrdenResult, CreateOrdenVars>(
  CreateOrdenMutation,
);

function resetForm() {
  state.numero_orden = "";
  state.cantidad = 0;
  state.cantidad_producida = undefined;
  state.cantidad_desperdicio = undefined;
  state.inicio_planificado = undefined;
  state.fin_planificado = undefined;
  state.inicio_real = undefined;
  state.fin_real = undefined;
  state.observaciones = undefined;
  state.producto_id = "";
  state.unidad_id = "";
  state.estado_id = "";
}

async function onSubmit(event: FormSubmitEvent<OrdenInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Orden producción creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear orden de producción">
    <UButton label="Nueva orden" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-orden-produccion"
        :schema="OrdenSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Número orden" name="numero_orden">
          <UInput v-model="state.numero_orden" />
        </UFormField>
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
        <UFormField label="Cantidad" name="cantidad">
          <UInputNumber v-model="state.cantidad" />
        </UFormField>
        <UFormField label="Cantidad producida" name="cantidad_producida">
          <UInputNumber v-model="state.cantidad_producida" />
        </UFormField>
        <UFormField label="Desperdicio" name="cantidad_desperdicio">
          <UInputNumber v-model="state.cantidad_desperdicio" />
        </UFormField>
        <UFormField label="Estado" name="estado_id">
          <UInputMenu
            v-model="state.estado_id"
            :items="estados"
            placeholder="Selecciona estado"
          />
        </UFormField>
        <UFormField label="Inicio planificado" name="inicio_planificado">
          <UInput v-model="state.inicio_planificado" placeholder="YYYY-MM-DD" />
        </UFormField>
        <UFormField label="Fin planificado" name="fin_planificado">
          <UInput v-model="state.fin_planificado" placeholder="YYYY-MM-DD" />
        </UFormField>
        <UFormField label="Observaciones" name="observaciones">
          <UInput v-model="state.observaciones" />
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
        label="Crear orden"
        type="submit"
        form="form-orden-produccion"
        color="neutral"
      />
    </template>
  </UModal>
</template>
