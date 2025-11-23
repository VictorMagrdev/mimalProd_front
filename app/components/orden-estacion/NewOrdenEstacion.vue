<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  CreateOrdenEstacionResult,
  OrdenEstacionOptionsResult,
} from "~/utils/types";

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

const { result } = useQuery<OrdenEstacionOptionsResult>(OrdenEstacionOptions);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);
const estaciones = computed(() => result.value?.estacionesProduccion ?? []);
const estados = computed(() => result.value?.estadosOrdenEstacion ?? []);

const OrdenEstacionSchema = z.object({
  inicioPlanificado: z.string().optional(),
  finPlanificado: z.string().optional(),
  inicioReal: z.string().optional(),
  finReal: z.string().optional(),
  observaciones: z.string().optional(),
  ordenId: z.string().min(1),
  estacionId: z.string().min(1),
  estadoId: z.string().min(1),
});
type OrdenEstacionInput = z.infer<typeof OrdenEstacionSchema>;

const state = reactive<OrdenEstacionInput>({
  inicioPlanificado: undefined,
  finPlanificado: undefined,
  inicioReal: undefined,
  finReal: undefined,
  observaciones: undefined,
  ordenId: "",
  estacionId: "",
  estadoId: "",
});

const CreateOrdenEstacionMutation = gql`
  mutation createOrdenEstacion($input: OrdenEstacionInput!) {
    createOrdenEstacion(input: $input) {
      id
    }
  }
`;
type CreateOrdenEstacionVars = { input: OrdenEstacionInput };
const { mutate } = useMutation<
  CreateOrdenEstacionResult,
  CreateOrdenEstacionVars
>(CreateOrdenEstacionMutation);

function resetForm() {
  state.inicioPlanificado = undefined;
  state.finPlanificado = undefined;
  state.inicioReal = undefined;
  state.finReal = undefined;
  state.observaciones = undefined;
  state.ordenId = "";
  state.estacionId = "";
  state.estadoId = "";
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
        <UFormField label="Orden" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
          />
        </UFormField>
        <UFormField label="Estación" name="estacionId">
          <UInputMenu
            v-model="state.estacionId"
            value-key="value"
            :items="estaciones"
            placeholder="Selecciona estación"
          />
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
        label="Crear orden estación"
        type="submit"
        form="form-orden-estacion"
        color="neutral"
      />
    </template>
  </UModal>
</template>
