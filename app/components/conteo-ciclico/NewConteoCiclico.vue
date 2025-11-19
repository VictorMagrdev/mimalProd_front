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
      label: numero_lote
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

const ConteoSchema = z.object({
  producto_id: z.string().min(1),
  bodega_id: z.string().min(1),
  lote_id: z.string().optional(),
  cantidad_contada: z.number().min(0),
  unidad_id: z.string().min(1),
  fecha: z.string().min(1),
});
type ConteoInput = z.infer<typeof ConteoSchema>;

const state = reactive<ConteoInput>({
  producto_id: "",
  bodega_id: "",
  lote_id: undefined,
  cantidad_contada: 0,
  unidad_id: "",
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
  state.producto_id = "";
  state.bodega_id = "";
  state.lote_id = undefined;
  state.cantidad_contada = 0;
  state.unidad_id = "";
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
        <UFormField label="Producto" name="producto_id">
          <UInputMenu
            v-model="state.producto_id"
            :items="productos"
            placeholder="Selecciona producto"
          />
        </UFormField>
        <UFormField label="Bodega" name="bodega_id">
          <UInputMenu
            v-model="state.bodega_id"
            :items="bodegas"
            placeholder="Selecciona bodega"
          />
        </UFormField>
        <UFormField label="Lote" name="lote_id">
          <UInputMenu
            v-model="state.lote_id"
            :items="lotes"
            placeholder="Selecciona lote"
          />
        </UFormField>
        <UFormField label="Cantidad contada" name="cantidad_contada">
          <UInputNumber v-model="state.cantidad_contada" />
        </UFormField>
        <UFormField label="Unidad" name="unidad_id">
          <UInputMenu
            v-model="state.unidad_id"
            :items="unidades"
            placeholder="Selecciona unidad"
          />
        </UFormField>
        <UFormField label="Fecha" name="fecha">
          <UInput v-model="state.fecha" placeholder="YYYY-MM-DD" />
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
