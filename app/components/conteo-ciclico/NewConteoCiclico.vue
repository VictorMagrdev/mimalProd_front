<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  ConteoCiclicoOptionsResult,
  CreateConteoResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const ConteoCiclicoOptions = gql`
  query ConteoCiclicoOptions {
    productos {
      value: id
      label: nombre
    }
    bodegas {
      value: id
      label: nombre
    }
    lotesProduccion {
      value: id
      label: numeroLote
    }
    unidadesMedida {
      value: id
      label: nombre
    }
  }
`;

type CreateConteoVars = {
  input: ConteoInput;
};

const { result } = useQuery<ConteoCiclicoOptionsResult>(ConteoCiclicoOptions);

const productos = computed(() => result.value?.productos || []);
const bodegas = computed(() => result.value?.bodegas || []);
const lotes = computed(() => result.value?.lotesProduccion || []);
const unidades = computed(() => result.value?.unidadesMedida || []);
const dateField = z
  .any()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    if (value?.toDate) {
      return value.toDate().toISOString();
    }
    return value;
  });
const ConteoSchema = z.object({
  productoId: z.string().min(1),
  bodegaId: z.string().min(1),
  loteId: z.string().optional(),
  cantidadContada: z.number().min(0),
  unidadId: z.string().min(1),
  fecha: dateField,
});
type ConteoInput = z.infer<typeof ConteoSchema>;

const state = reactive<ConteoInput>({
  productoId: "",
  bodegaId: "",
  loteId: undefined,
  cantidadContada: 0,
  unidadId: "",
  fecha: "",
});

const CreateConteoMutation = gql`
  mutation createConteoCiclico($input: ConteoCiclicoRequest!) {
    createConteoCiclico(input: $input) {
      id
    }
  }
`;

const { mutate } = useMutation<CreateConteoResult, CreateConteoVars>(
  CreateConteoMutation,
);

function resetForm() {
  state.productoId = "";
  state.bodegaId = "";
  state.loteId = undefined;
  state.cantidadContada = 0;
  state.unidadId = "";
  state.fecha = "";
}

async function onSubmit(event: FormSubmitEvent<ConteoInput>) {
  try {
    await mutate({ input: event.data });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear conteo cíclico">
    <UButton label="Nuevo conteo" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-conteo"
        :schema="ConteoSchema"
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
        <UFormField label="Bodega" name="bodegaId">
          <UInputMenu
            v-model="state.bodegaId"
            value-key="value"
            :items="bodegas"
            placeholder="Selecciona bodega"
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
        <UFormField label="Cantidad contada" name="cantidad_contada">
          <UInputNumber v-model="state.cantidadContada" class="w-full" />
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
        <UFormField label="Fecha" name="fecha">
          <UInputDate v-model="state.fecha" class="w-full" />
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
        label="Crear conteo"
        type="submit"
        form="form-conteo"
        color="neutral"
      />
    </template>
  </UModal>
</template>
