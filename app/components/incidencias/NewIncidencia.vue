<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { z } from "zod";
import type { IncidenciaOptionsResult } from "~/utils/types";
import AudioRecorder from "./AudioRecorder.vue";

const emit = defineEmits<{ (e: "creada"): void }>();
const toast = useToast();
const open = ref(false);
const auth = useAuthStore();
const IncidenciaOptions = gql`
  query IncidenciaOptions {
    tiposIncidencia {
      value: id
      label: nombre
    }
    estadosIncidencia {
      value: id
      label: nombre
    }
    maquinas {
      value: id
      label: nombre
    }
    ordenesProduccion {
      value: id
      label: numeroOrden
    }
    estacionesProduccion {
      value: id
      label: nombre
    }
  }
`;

const { result } = useQuery<IncidenciaOptionsResult>(IncidenciaOptions);
const tiposIncidencia = computed(() => options.value.tiposIncidencia);
const estadosIncidencia = computed(() => options.value.estadosIncidencia);
const maquinas = computed(() => options.value.maquinas);
const ordenesProduccion = computed(() => options.value.ordenesProduccion);
const estacionesProduccion = computed(() => options.value.estacionesProduccion);

type UserMinimal = { id: number; nombre?: string; username: string };

const users = ref<{ value: number; label: string }[]>([]);

const { data: usersData } = await useFetch<UserMinimal[]>(
  "https://engagement-roommate-martha-brunette.trycloudflare.com/api/users",
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

const options = computed(
  () =>
    result.value ?? {
      tiposIncidencia: [],
      estadosIncidencia: [],
      maquinas: [],
      ordenesProduccion: [],
      estacionesProduccion: [],
    },
);

const stringFromNumber = z.union([z.string(), z.number()]).transform(String);

const IncidenciaSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  tipoIncidenciaId: stringFromNumber.refine(
    (v) => v.length > 0,
    "El tipo de incidencia es requerido",
  ),
  estadoId: stringFromNumber.refine(
    (v) => v.length > 0,
    "El estado es requerido",
  ),
  maquinaId: stringFromNumber.optional(),
  ordenId: stringFromNumber.optional(),
  estacionId: stringFromNumber.optional(),
  asignadoA: stringFromNumber.optional(),
  reportadoPor: stringFromNumber.optional(),
  fechaCierre: z.string().optional(),
  tiempoParada: stringFromNumber.optional(),
});

type IncidenciaInput = z.infer<typeof IncidenciaSchema>;

const state = reactive<IncidenciaInput>({
  codigo: "",
  titulo: "",
  descripcion: "",
  tipoIncidenciaId: "",
  estadoId: "",
  maquinaId: "",
  ordenId: "",
  estacionId: "",
  asignadoA: "",
  reportadoPor: "",
  fechaCierre: "",
  tiempoParada: "",
});

const resetForm = () => {
  Object.assign(state, {
    codigo: "",
    titulo: "",
    descripcion: "",
    tipoIncidenciaId: "",
    estadoId: "",
    maquinaId: "",
    ordenId: "",
    estacionId: "",
    asignadoA: "",
    reportadoPor: "",
    fechaCierre: "",
    tiempoParada: "",
  });
  fotos.value = [];
  audioUrl.value = null;
  audioBlob.value = null;
};
// Archivos
const fotos = ref<File[]>([]);
const audioUrl = ref<string | null>(null);
const audioBlob = ref<Blob | null>(null);

const onSubmit = async () => {
  try {
    if (fotos.value.length === 0) {
      toast.add({ title: "Debe subir al menos una foto", color: "error" });
      return;
    }

    if (!audioBlob.value || audioBlob.value.size === 0) {
      toast.add({
        title: "El audio está vacío o no se grabó correctamente",
        color: "error",
      });
      return;
    }

    const formData = new FormData();
    const payload = {
      codigo: state.codigo,
      titulo: state.titulo,
      descripcion: state.descripcion || null,
      tipoIncidenciaId: parseInt(state.tipoIncidenciaId),
      estadoId: parseInt(state.estadoId),
      maquinaId: state.maquinaId ? parseInt(state.maquinaId) : null,
      ordenId: state.ordenId ? parseInt(state.ordenId) : null,
      estacionId: state.estacionId ? parseInt(state.estacionId) : null,
      reportadoPor: state.reportadoPor ? parseInt(state.reportadoPor) : null,
      asignadoA: state.asignadoA ? parseInt(state.asignadoA) : null,
      fechaCierre: state.fechaCierre
        ? new Date(state.fechaCierre).toISOString()
        : null,
      tiempoParada: state.tiempoParada
        ? `PT${Math.floor(parseFloat(state.tiempoParada))}H${Math.round((parseFloat(state.tiempoParada) % 1) * 60)}M`
        : null,
    };
    formData.append(
      "incidencia",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    fotos.value.forEach((f) => formData.append("archivos", f));
    formData.append(
      "archivos",
      new File([audioBlob.value], "grabacion.webm", { type: "audio/webm" }),
    );

    await $fetch(
      "https://engagement-roommate-martha-brunette.trycloudflare.com/api/incidencias/con-archivos",
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    toast.add({ title: "Incidencia creada exitosamente", color: "success" });
    emit("creada");
    resetForm();
    open.value = false;
  } catch (ere) {
    toast.add({
      title: "Error al crear la incidencia",
      description: String(ere),
      color: "error",
    });
  }
};
</script>

<template>
  <UModal
    v-model:open="open"
    title="Crear Incidencia"
    description="Complete el formulario para registrar una nueva incidencia."
    size="lg"
  >
    <UButton label="Nueva Incidencia" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-incidencia"
        :schema="IncidenciaSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Código" name="codigo">
            <UInput
              v-model="state.codigo"
              placeholder="INC-001"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Título" name="titulo">
            <UInput
              v-model="state.titulo"
              placeholder="Título de la incidencia"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Descripción" name="descripcion">
          <UTextarea
            v-model="state.descripcion"
            placeholder="Descripción detallada..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="reportado por" name="reportadoPor">
          <UInputMenu
            v-model="state.reportadoPor as unknown as number"
            :items="users"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField label="asignado A" name="asignadoA">
          <UInputMenu
            v-model="state.asignadoA as unknown as number"
            :items="users"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tipo de Incidencia" name="tipoIncidenciaId">
          <USelect
            v-model="state.tipoIncidenciaId"
            :items="tiposIncidencia"
            placeholder="Seleccione tipo"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Estado" name="estadoId">
          <USelect
            v-model="state.estadoId"
            :items="estadosIncidencia"
            placeholder="Seleccione estado"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Máquina" name="maquinaId">
          <USelect
            v-model="state.maquinaId"
            :items="maquinas"
            placeholder="Seleccione máquina"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Orden Producción" name="ordenId">
          <USelect
            v-model="state.ordenId"
            :items="ordenesProduccion"
            placeholder="Seleccione orden"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Estación" name="estacionId">
          <USelect
            v-model="state.estacionId"
            :items="estacionesProduccion"
            placeholder="Seleccione estación"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Fecha de Cierre" name="fechaCierre">
          <UInputDateTime v-model="state.fechaCierre" />
        </UFormField>
        <UFormField label="Tiempo de Parada (horas)" name="tiempoParada">
          <UInput
            v-model="state.tiempoParada"
            type="number"
            step="0.1"
            placeholder="0.0"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Fotos (mínimo 1)">
          <UFileUpload
            v-model="fotos"
            accept="image/*"
            icon="i-lucide-image"
            label="Arrastra o selecciona tus fotos"
            description="JPG, PNG o WebP (máx. 2 MB)"
            layout="list"
            multiple
            class="w-full min-h-40"
          >
            <template #actions="{ open: openFileDialog }">
              <UButton
                label="Seleccionar imágenes"
                icon="i-lucide-upload"
                color="neutral"
                variant="outline"
                @click="openFileDialog()"
              />
            </template>

            <template #files-bottom="{ removeFile, files }">
              <div class="flex justify-between items-center mt-3 w-full">
                <span class="text-sm text-gray-500">
                  {{ files?.length }} imagen{{
                    files?.length !== 1 ? "es" : ""
                  }}
                  seleccionada{{ files?.length !== 1 ? "s" : "" }}
                </span>
                <UButton
                  v-if="files?.length"
                  label="Eliminar todas"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  @click="removeFile()"
                />
              </div>
            </template>
          </UFileUpload>
        </UFormField>

        <!-- AUDIO -->
        <UFormField label="Audio (máx. 2 minutos)">
          <AudioRecorder
            @update:audio-url="audioUrl = $event"
            @update:audio-blob="audioBlob = $event"
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
        label="Crear Incidencia"
        type="submit"
        form="form-incidencia"
        color="primary"
      />
    </template>
  </UModal>
</template>
