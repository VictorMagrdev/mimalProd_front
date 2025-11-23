<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
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
  cantidadProducida: z.number().optional(),
  cantidadDesperdicio: z.number().optional(),
  inicioPlanificado: z.string().optional(),
  finPlanificado: z.string().optional(),
  inicioReal: z.string().optional(),
  finReal: z.string().optional(),
  observaciones: z.string().optional(),
  productoId: z.string().min(1),
  unidadId: z.string().min(1),
  estadoId: z.string().min(1),
});
type OrdenInput = z.infer<typeof OrdenSchema>;

const state = reactive<OrdenInput>({
  numero_orden: "",
  cantidad: 0,
  cantidadProducida: undefined,
  cantidadDesperdicio: undefined,
  inicioPlanificado: undefined,
  finPlanificado: undefined,
  inicioReal: undefined,
  finReal: undefined,
  observaciones: undefined,
  productoId: "",
  unidadId: "",
  estadoId: "",
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
  state.cantidadProducida = undefined;
  state.cantidadDesperdicio = undefined;
  state.inicioPlanificado = undefined;
  state.finPlanificado = undefined;
  state.inicioReal = undefined;
  state.finReal = undefined;
  state.observaciones = undefined;
  state.productoId = "";
  state.unidadId = "";
  state.estadoId = "";
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
        <UFormField label="Cantidad" name="cantidad">
          <UInputNumber v-model="state.cantidad" />
        </UFormField>
        <UFormField label="Cantidad producida" name="cantidadProducida">
          <UInputNumber v-model="state.cantidadProducida" />
        </UFormField>
        <UFormField label="Desperdicio" name="cantidadDesperdicio">
          <UInputNumber v-model="state.cantidadDesperdicio" />
        </UFormField>
        <UFormField label="Estado" name="estadoId">
          <UInputMenu
            v-model="state.estadoId"
            value-key="value"
            :items="estados"
            placeholder="Selecciona estado"
          />
        </UFormField>
        <UFormField label="Inicio planificado" name="inicioPlanificado">
          <UInput v-model="state.inicioPlanificado" placeholder="YYYY-MM-DD" />
        </UFormField>
        <UFormField label="Fin planificado" name="finPlanificado">
          <UInput v-model="state.finPlanificado" placeholder="YYYY-MM-DD" />
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
