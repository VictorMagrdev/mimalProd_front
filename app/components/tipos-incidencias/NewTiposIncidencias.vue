<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { z } from "zod";
import type { CreateTipoIncidenciaResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoIncidenciaSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  prioridadBase: z.enum(["LEVE", "MEDIA", "ALTA"]),
});

type TipoIncidenciaInput = z.infer<typeof TipoIncidenciaSchema>;

const state = reactive<TipoIncidenciaInput>({
  codigo: "",
  nombre: "",
  descripcion: "",
  prioridadBase: "MEDIA",
});

// Opciones de prioridad
const prioridades = [
  { value: "LEVE", label: "Leve" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
];

const CreateTipoIncidenciaMutation = gql`
  mutation CreateTipoIncidencia($input: TipoIncidenciaRequest!) {
    crearTipoIncidencia(input: $input) {
      id
    }
  }
`;

type CreateTipoIncidenciaVars = { input: TipoIncidenciaInput };

const { mutate } = useMutation<
  CreateTipoIncidenciaResult,
  CreateTipoIncidenciaVars
>(CreateTipoIncidenciaMutation);

function resetForm() {
  Object.assign(state, {
    codigo: "",
    nombre: "",
    descripcion: "",
    prioridadBase: "MEDIA",
  });
}

async function onSubmit(event: FormSubmitEvent<TipoIncidenciaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({
      title: "Tipo de incidencia creado exitosamente",
      color: "success",
    });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (error) {
    toast.add({
      title: "Error al crear el tipo de incidencia",
      description: String(error),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear Tipo de Incidencia">
    <UButton label="Nuevo Tipo" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-tipo-incidencia"
        :schema="TipoIncidenciaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Código" name="codigo">
            <UInput v-model="state.codigo" placeholder="TIPO-001" />
          </UFormField>

          <UFormField label="Nombre" name="nombre">
            <UInput v-model="state.nombre" placeholder="Nombre del tipo" />
          </UFormField>
        </div>

        <UFormField label="Descripción" name="descripcion">
          <UTextarea
            v-model="state.descripcion"
            placeholder="Descripción del tipo..."
          />
        </UFormField>

        <UFormField label="Prioridad Base" name="prioridadBase">
          <USelect
            v-model="state.prioridadBase"
            :items="prioridades"
            placeholder="Seleccione prioridad"
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
        label="Crear Tipo"
        type="submit"
        form="form-tipo-incidencia"
        color="neutral"
      />
    </template>
  </UModal>
</template>
