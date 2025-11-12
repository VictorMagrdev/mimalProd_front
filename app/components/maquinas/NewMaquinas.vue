<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { gql } from "graphql-tag";
import type { SelectOption, CentroCosto, CreateMaquinaResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creada"): void }>();
const toast = useToast();
const open = ref(false);
const auth = useAuthStore();



const centrosCosto = ref<SelectOption[]>([]);


const cargarCentrosCosto = async () => {
  try {
    const { data, error } = await useFetch<CentroCosto[]>(
      "http://localhost:8080/api/v1/centros-costo",
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    if (error.value) throw new Error(error.value.message);

    centrosCosto.value =
      data.value?.map((c) => ({
        value: c.id,
        label: c.nombre,
      })) ?? [];
  } catch (err) {
    toast.add({
      title: "Error al cargar centros de costo",
      description: String(err),
      color: "error",
    });
  }
};

onMounted(() => {
  cargarCentrosCosto();
});

const MaquinaSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  numeroSerie: z.string().optional(),
  fechaCompra: z.string().min(1, "La fecha de compra es requerida"),
  costoCompra: z.number().min(0, "El costo debe ser mayor a 0"),
  valorRescate: z.number().min(0).optional(),
  vidaUtilAnios: z.number().min(1, "La vida útil debe ser al menos 1 año"),
  centroCostoId: z.number().min(1, "El centro de costo es requerido"),
});

type MaquinaInput = z.infer<typeof MaquinaSchema>;

const state = reactive<MaquinaInput>({
  codigo: "",
  nombre: "",
  descripcion: "",
  numeroSerie: "",
  fechaCompra: "",
  costoCompra: 0,
  valorRescate: undefined,
  vidaUtilAnios: 1,
  centroCostoId: null as unknown as number,
});

const CreateMaquinaMutation = gql`
  mutation CreateMaquina($input: MaquinaRequest!) {
    createMaquina(input: $input) {
      id
    }
  }
`;

type CreateMaquinaVars = { input: MaquinaInput };

const { mutate } = useMutation<CreateMaquinaResult, CreateMaquinaVars>(
  CreateMaquinaMutation,
);

function resetForm() {
  Object.assign(state, {
    codigo: "",
    nombre: "",
    descripcion: "",
    numeroSerie: "",
    fechaCompra: "",
    costoCompra: 0,
    valorRescate: undefined,
    vidaUtilAnios: 1,
    centroCostoId: undefined,
  });
}

async function onSubmit(event: FormSubmitEvent<MaquinaInput>) {
  try {
    const input = {
      ...event.data,
      costoCompra: Number(event.data.costoCompra),
      valorRescate:
        event.data.valorRescate !== null &&
        event.data.valorRescate !== undefined
          ? Number(event.data.valorRescate)
          : undefined,
      vidaUtilAnios: Number(event.data.vidaUtilAnios),
    };

    await mutate({ input });
    toast.add({ title: "Máquina creada exitosamente", color: "success" });
    emit("creada");
    resetForm();
    open.value = false;
  } catch (error) {
    toast.add({
      title: "Error al crear la máquina",
      description: String(error),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear Máquina" size="lg">
    <UButton label="Nueva Máquina" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-maquina"
        :schema="MaquinaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" placeholder="MAQ-001" class="w-full" />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput
            v-model="state.nombre"
            placeholder="Nombre de la máquina"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UTextarea
            v-model="state.descripcion"
            placeholder="Descripción de la máquina..."
            class="w-full"
          />
        </UFormField>

        <UFormField label="Número de Serie" name="numeroSerie">
          <UInput
            v-model="state.numeroSerie"
            placeholder="SN123456"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Centro de Costo" name="centroCostoId">
          <USelect
            v-model="state.centroCostoId"
            :items="centrosCosto"
            placeholder="Seleccione centro de costo"
            :loading="!centrosCosto.length"
            loading-icon="i-heroicons-arrow-path"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-3 gap-4">
          <UFormField label="Fecha de Compra" name="fechaCompra">
            <UInput v-model="state.fechaCompra" type="date" class="w-full" />
          </UFormField>

          <UFormField label="Costo de Compra" name="costoCompra">
            <UInput
              v-model="state.costoCompra"
              type="number"
              step="0.01"
              class="w-full"
            >
              <template #leading>
                <span class="text-gray-500">$</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Valor de Rescate" name="valorRescate">
            <UInput
              v-model="state.valorRescate"
              type="number"
              step="0.01"
              class="w-full"
            >
              <template #leading>
                <span class="text-gray-500">$</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField label="Vida Útil (años)" name="vidaUtilAnios">
          <UInput
            v-model="state.vidaUtilAnios"
            type="number"
            min="1"
            class="w-full"
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
        label="Crear Máquina"
        type="submit"
        form="form-maquina"
        color="neutral"
      />
    </template>
  </UModal>
</template>
