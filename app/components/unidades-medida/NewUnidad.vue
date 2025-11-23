<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  CreateUnidadResult,
  TipoUnidadOptionsResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const toast = useToast();
const open = ref(false);

const TipoUnidadOptionsQuery = gql`
  query GetUnidadesMedidaTipo {
    unidadesMedidaTipo {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<TipoUnidadOptionsResult>(TipoUnidadOptionsQuery);
const tipos = computed(() => result.value?.unidadesMedidaTipo ?? []);

const UnidadSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  abreviatura: z.string().min(1),
  activa: z.boolean().optional(),
  base: z.boolean().optional(),
  tipo_id: z.string().min(1),
});
type UnidadInput = z.infer<typeof UnidadSchema>;

const state = reactive<UnidadInput>({
  codigo: "",
  nombre: "",
  abreviatura: "",
  activa: true,
  base: false,
  tipo_id: "",
});

const CreateUnidadMutation = gql`
  mutation createUnidadMedida($input: UnidadMedidaInput!) {
    createUnidadMedida(input: $input) {
      id
    }
  }
`;
type CreateUnidadVars = { input: UnidadInput };
const { mutate } = useMutation<CreateUnidadResult, CreateUnidadVars>(
  CreateUnidadMutation,
);

function resetForm() {
  state.codigo = "";
  state.nombre = "";
  state.abreviatura = "";
  state.activa = true;
  state.base = false;
  state.tipo_id = "";
}

async function onSubmit(event: FormSubmitEvent<UnidadInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Unidad medida creada", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear unidad de medida">
    <UButton label="Nueva unidad" color="neutral" variant="subtle" />
    <template #body>
      <UForm
        id="form-unidad"
        :schema="UnidadSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Código" name="codigo">
          <UInput v-model="state.codigo" />
        </UFormField>
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" />
        </UFormField>
        <UFormField label="Abreviatura" name="abreviatura">
          <UInput v-model="state.abreviatura" />
        </UFormField>
        <UFormField label="Tipo" name="tipo_id">
          <UInputMenu
            v-model="state.tipo_id"
            value-key="value"
            :items="tipos"
            placeholder="Selecciona tipo"
          />
        </UFormField>
        <UFormField label="Activa" name="activa">
          <UCheckbox v-model="state.activa" />
        </UFormField>
        <UFormField label="Base" name="base">
          <UCheckbox v-model="state.base" />
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
        label="Crear unidad"
        type="submit"
        form="form-unidad"
        color="neutral"
      />
    </template>
  </UModal>
</template>
