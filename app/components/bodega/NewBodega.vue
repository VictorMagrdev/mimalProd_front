<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { BodegaOptionsResult, CreateBodegaResult } from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

type CreateBodegaVars = {
  input: BodegaInput;
};

const BodegaOptionsQuery = gql`
  query BodegaOptions {
    tiposBodega {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<BodegaOptionsResult>(BodegaOptionsQuery);
const tiposOptions = computed(() => result.value?.tiposBodega ?? []);

const CreateBodegaMutation = gql`
  mutation createBodega($input: BodegaRequest!) {
    createBodega(input: $input) {
      id
    }
  }
`;

const { mutate } = useMutation<CreateBodegaResult, CreateBodegaVars>(
  CreateBodegaMutation,
);

const BodegaSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  tipoId: z.string().min(1),
});
type BodegaInput = z.infer<typeof BodegaSchema>;

const state = reactive<BodegaInput>({
  codigo: "",
  nombre: "",
  descripcion: "",
  tipoId: "",
});

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.descripcion = "";
  state.tipoId = "";
}

async function onSubmit(event: FormSubmitEvent<BodegaInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Bodega creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear bodega">
    <UButton label="Nueva bodega" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-bodega"
        :schema="BodegaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" placeholder="Código" />
        </UFormField>
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" placeholder="Nombre" />
        </UFormField>
        <UFormField label="Descripción" name="descripcion">
          <UInput v-model="state.descripcion" placeholder="Descripción" />
        </UFormField>
        <UFormField label="Tipo" name="tipoId">
          <UInputMenu
            v-model="state.tipoId"
            value-key="value"
            :items="tiposOptions"
            placeholder="Selecciona tipo"
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
        label="Crear bodega"
        type="submit"
        form="form-bodega"
        color="neutral"
      />
    </template>
  </UModal>
</template>
