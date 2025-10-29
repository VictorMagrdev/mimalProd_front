<script setup lang="ts">
import { reactive, ref } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

// Esquema de validación
const EstadoIncidenciaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  orden: z.number().min(1, "El orden debe ser mayor a 0"),
  estadoFinal: z.boolean().default(false),
});

type EstadoIncidenciaInput = z.infer<typeof EstadoIncidenciaSchema>;

const state = reactive<EstadoIncidenciaInput>({
  nombre: "",
  descripcion: "",
  orden: 1,
  estadoFinal: false,
});

// Mutación para crear estado de incidencia
const CreateEstadoIncidenciaMutation = gql`
  mutation CreateEstadoIncidencia($input: EstadoIncidenciaRequest!) {
    createEstadoIncidencia(input: $input) {
      id
    }
  }
`;

type CreateEstadoIncidenciaResult = { createEstadoIncidencia: { id: string } };
type CreateEstadoIncidenciaVars = { input: EstadoIncidenciaInput };

const { mutate } = useMutation<
  CreateEstadoIncidenciaResult,
  CreateEstadoIncidenciaVars
>(CreateEstadoIncidenciaMutation);

function resetForm() {
  Object.assign(state, {
    nombre: "",
    descripcion: "",
    orden: 1,
    estadoFinal: false,
  });
}

async function onSubmit(event: FormSubmitEvent<EstadoIncidenciaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({
      title: "Estado de incidencia creado exitosamente",
      color: "success",
    });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (error) {
    toast.add({
      title: "Error al crear el estado de incidencia",
      description: String(error),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear Estado de Incidencia">
    <UButton label="Nuevo Estado" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-estado-incidencia"
        :schema="EstadoIncidenciaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" placeholder="Nombre del estado" />
        </UFormField>

        <UFormField label="Descripción" name="descripcion">
          <UTextarea
            v-model="state.descripcion"
            placeholder="Descripción del estado..."
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Orden" name="orden">
            <UInput
              v-model="state.orden"
              type="number"
              min="1"
              placeholder="1"
            />
          </UFormField>

          <UFormField label="Estado Final" name="estadoFinal">
            <div class="pt-2">
              <UCheckbox
                v-model="state.estadoFinal"
                label="Marcar como estado final"
              />
            </div>
          </UFormField>
        </div>
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
        label="Crear Estado"
        type="submit"
        form="form-estado-incidencia"
        color="neutral"
      />
    </template>
  </UModal>
</template>
