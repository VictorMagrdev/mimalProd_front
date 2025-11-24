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
      label: numeroOrden
    }
  }
`;

const { result } = useQuery<OrdenOptionsResult>(OrdenOptionsQuery);
const ordenes = computed(() => result.value?.ordenesProduccion ?? []);
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
const EventoSchema = z.object({
  evento: z.string().min(1),
  descripcion: z.string().optional(),
  fecha: dateField,
  ordenId: z.string().min(1),
});
type EventoInput = z.infer<typeof EventoSchema>;

const state = reactive<EventoInput>({
  evento: "",
  descripcion: undefined,
  fecha: "",
  ordenId: "",
});

const CreateEventoMutation = gql`
  mutation createOrdenEvento($input: OrdenEventoRequest!) {
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
  state.ordenId = "";
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
          <UInput v-model="state.evento" class="w-full" />
        </UFormField>
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" class="w-full" />
        </UFormField>
        <UFormField label="Fecha" name="fecha">
          <UInputDate v-model="state.fecha" class="w-full" />
        </UFormField>
        <UFormField label="Orden" name="ordenId">
          <UInputMenu
            v-model="state.ordenId"
            value-key="value"
            :items="ordenes"
            placeholder="Selecciona orden"
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
        label="Crear evento"
        type="submit"
        form="form-orden-evento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
