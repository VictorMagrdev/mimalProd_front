<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type {
  CreateMovimientoResult,
  MovimientoOptionsResult,
} from "~/utils/types";

const emit = defineEmits<{ (e: "creado"): void }>();
const auth = useAuthStore();
const toast = useToast();
const open = ref(false);

type UserMinimal = { id: number; nombre?: string; username: string };

const users = ref<{ value: number; label: string }[]>([]);

const { data: usersData } = await useFetch<UserMinimal[]>(
  "http://localhost:8080/api/users",
  {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.token}` },
    default: () => [],
  },
);

users.value =
  usersData.value?.map((u) => ({
    value: u.id,
    label: u.nombre ?? u.username ?? "Sin nombre",
  })) ?? [];

const MovimientoOptions = gql`
  query MovimientoInventarioOptions {
    bodegas {
      value: id
      label: nombre
    }
    tiposMovimiento {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<MovimientoOptionsResult>(MovimientoOptions);
const bodegas = computed(() => result.value?.bodegas ?? []);
const tipos = computed(() => result.value?.tiposMovimiento ?? []);

const dateField = z
  .any()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    if (value?.toDate) return value.toDate().toISOString();
    return value;
  });

const MovimientoSchema = z.object({
  fecha: dateField,
  referencia: z.string().optional(),
  observaciones: z.string().optional(),
  creadoPor: z.number().optional(),
  bodegaOrigenId: z.string().optional(),
  bodegaDestinoId: z.string().optional(),
  tipoMovimientoId: z.string().min(1),
});

type MovimientoInput = z.infer<typeof MovimientoSchema>;

const state = reactive<MovimientoInput>({
  fecha: "",
  referencia: undefined,
  observaciones: undefined,
  creadoPor: undefined,
  bodegaOrigenId: undefined,
  bodegaDestinoId: undefined,
  tipoMovimientoId: "",
});

const CreateMovimientoMutation = gql`
  mutation createMovimientoInventario($input: MovimientoInventarioRequest!) {
    createMovimientoInventario(input: $input) {
      id
    }
  }
`;

type CreateMovimientoVars = { input: MovimientoInput };
const { mutate } = useMutation<CreateMovimientoResult, CreateMovimientoVars>(
  CreateMovimientoMutation,
);

function resetForm() {
  Object.assign(state, {
    fecha: "",
    referencia: undefined,
    observaciones: undefined,
    creadoPor: undefined,
    bodegaOrigenId: undefined,
    bodegaDestinoId: undefined,
    tipoMovimientoId: "",
  });
}

async function onSubmit(event: FormSubmitEvent<MovimientoInput>) {
  try {
    await mutate({ input: event.data });
    toast.add({ title: "Movimiento creado", color: "success" });
    emit("creado");
    resetForm();
    open.value = false;
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear movimiento de inventario">
    <UButton label="Nuevo movimiento" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-movimiento"
        :schema="MovimientoSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Creado por" name="creadoPor">
          <UInputMenu
            v-model="state.creadoPor"
            :items="users"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Fecha" name="fecha">
          <UInputDate v-model="state.fecha" class="w-full" />
        </UFormField>

        <UFormField label="Referencia" name="referencia">
          <UInput v-model="state.referencia" class="w-full" />
        </UFormField>

        <UFormField label="Observaciones" name="observaciones">
          <UInput v-model="state.observaciones" class="w-full" />
        </UFormField>

        <UFormField label="Bodega origen" name="bodegaOrigenId">
          <UInputMenu
            v-model="state.bodegaOrigenId"
            :items="bodegas"
            value-key="value"
            placeholder="Selecciona bodega origen"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Bodega destino" name="bodegaDestinoId">
          <UInputMenu
            v-model="state.bodegaDestinoId"
            :items="bodegas"
            value-key="value"
            placeholder="Selecciona bodega destino"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tipo movimiento" name="tipoMovimientoId">
          <UInputMenu
            v-model="state.tipoMovimientoId"
            :items="tipos"
            value-key="value"
            placeholder="Selecciona tipo"
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
        label="Crear movimiento"
        type="submit"
        form="form-movimiento"
        color="neutral"
      />
    </template>
  </UModal>
</template>
