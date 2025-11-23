<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { CreateEventoResult, OrdenOptionsResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const OrdenOptionsQuery = gql`
  query OrdenEventoOptions {
    ordenesProduccion {
      value: id
      label: numero_orden
    }
  }
`;

const { result } = useQuery<OrdenOptionsResult>(OrdenOptionsQuery);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);

const EventoSchema = z.object({
  evento: z.string().min(1),
  descripcion: z.string().optional(),
  fecha: z.string().min(1),
  orden_id: z.string().min(1),
});
type EventoInput = z.infer<typeof EventoSchema>;

const state = reactive<EventoInput>({
  evento: "",
  descripcion: undefined,
  fecha: "",
  orden_id: "",
});

const CreateEventoMutation = gql`
  mutation createOrdenEvento($input: OrdenEventoInput!) {
    createOrdenEvento(input: $input) {
      id
    }
  }
`;
type CreateEventoVars = { input: EventoInput };
const { mutate } = useMutation<CreateEventoResult, CreateEventoVars>(
  CreateEventoMutation,
);

function resetForm() {
  state.evento = "";
  state.descripcion = undefined;
  state.fecha = "";
  state.orden_id = "";
}

async function onSubmit(event: FormSubmitEvent<EventoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Orden evento creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear evento de orden">
    <UButton label="Nuevo evento" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-orden-evento"
        :schema="EventoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Evento" name="evento">
          <UInput v-model="state.evento" />
        </UFormField>
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" />
        </UFormField>
        <UFormField label="Fecha" name="fecha">
          <UInput v-model="state.fecha" placeholder="YYYY-MM-DD" />
        </UFormField>
        <UFormField label="Orden" name="orden_id">
          <UInputMenu
            v-model="state.orden_id"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
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
        label="Crear evento"
        type="submit"
        form="form-orden-evento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
