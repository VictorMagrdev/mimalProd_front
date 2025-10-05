<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const OrdenEstacionOptions = gql`
  query OrdenEstacionOptions {
    ordenesProduccion {
      value: id
      label: numero_orden
    }
    estacionesProduccion {
      value: id
      label: nombre
    }
    estadosOrdenEstacion: estadosOrden {
      value: id
      label: nombre
    }
  }
`;
type OrdenEstacionOptionsResult = {
  ordenesProduccion: { value: string; label: string }[];
  estacionesProduccion: { value: string; label: string }[];
  estadosOrdenEstacion: { value: string; label: string }[];
};
const { result } = useQuery<OrdenEstacionOptionsResult>(OrdenEstacionOptions);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);
const estaciones = computed(() => result.value?.estacionesProduccion ?? []);
const estados = computed(() => result.value?.estadosOrdenEstacion ?? []);

const OrdenEstacionSchema = z.object({
  inicio_planificado: z.string().optional(),
  fin_planificado: z.string().optional(),
  inicio_real: z.string().optional(),
  fin_real: z.string().optional(),
  observaciones: z.string().optional(),
  orden_id: z.string().min(1),
  estacion_id: z.string().min(1),
  estado_id: z.string().min(1),
});
type OrdenEstacionInput = z.infer<typeof OrdenEstacionSchema>;

const state = reactive<OrdenEstacionInput>({
  inicio_planificado: undefined,
  fin_planificado: undefined,
  inicio_real: undefined,
  fin_real: undefined,
  observaciones: undefined,
  orden_id: "",
  estacion_id: "",
  estado_id: "",
});

const CreateOrdenEstacionMutation = gql`
  mutation createOrdenEstacion($input: OrdenEstacionInput!) {
    createOrdenEstacion(input: $input) {
      id
    }
  }
`;
type CreateOrdenEstacionResult = { createOrdenEstacion: { id: string } };
type CreateOrdenEstacionVars = { input: OrdenEstacionInput };
const { mutate } = useMutation<
  CreateOrdenEstacionResult,
  CreateOrdenEstacionVars
>(CreateOrdenEstacionMutation);

function resetForm() {
  state.inicio_planificado = undefined;
  state.fin_planificado = undefined;
  state.inicio_real = undefined;
  state.fin_real = undefined;
  state.observaciones = undefined;
  state.orden_id = "";
  state.estacion_id = "";
  state.estado_id = "";
}

async function onSubmit(event: FormSubmitEvent<OrdenEstacionInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Orden estación creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear orden estación">
    <UButton label="Nueva orden estación" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-orden-estacion"
        :schema="OrdenEstacionSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Orden" name="orden_id">
          <UInputMenu
            v-model="state.orden_id"
            :items="ordenes"
            placeholder="Selecciona orden"
          />
        </UFormField>
        <UFormField label="Estación" name="estacion_id">
          <UInputMenu
            v-model="state.estacion_id"
            :items="estaciones"
            placeholder="Selecciona estación"
          />
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
        label="Crear orden estación"
        type="submit"
        form="form-orden-estacion"
        color="neutral"
      />
    </template>
  </UModal>
</template>
