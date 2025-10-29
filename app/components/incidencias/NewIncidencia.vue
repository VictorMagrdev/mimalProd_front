<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { z } from "zod";
import AudioRecorder from "./AudioRecorder.vue";
const emit = defineEmits<{ (e: "creada"): void }>();
const toast = useToast();
const open = ref(false);

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

type IncidenciaOptionsResult = {
  tiposIncidencia: { value: string; label: string }[];
  estadosIncidencia: { value: string; label: string }[];
  maquinas: { value: string; label: string }[];
  ordenesProduccion: { value: string; label: string }[];
  estacionesProduccion: { value: string; label: string }[];
};

const { result } = useQuery<IncidenciaOptionsResult>(IncidenciaOptions);
const tiposIncidencia = computed(() => result.value?.tiposIncidencia ?? []);
const estadosIncidencia = computed(() => result.value?.estadosIncidencia ?? []);
const maquinas = computed(() => result.value?.maquinas ?? []);
const ordenesProduccion = computed(() => result.value?.ordenesProduccion ?? []);
const estacionesProduccion = computed(
  () => result.value?.estacionesProduccion ?? [],
);

// Esquema de validación
const IncidenciaSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  tipoIncidenciaId: z.string().min(1, "El tipo de incidencia es requerido"),
  estadoId: z.string().min(1, "El estado es requerido"),
  maquinaId: z.string().optional(),
  ordenId: z.string().optional(),
  estacionId: z.string().optional(),
  fechaCierre: z.string().optional(),
  tiempoParada: z.string().optional(),
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
  fechaCierre: "",
  tiempoParada: "",
});

// Archivos
const fotos = ref<File[]>([]);
const audioUrl = ref<string | null>(null);
const audioBlob = ref<Blob | null>(null);

function removeFoto(index: number) {
  fotos.value.splice(index, 1);
}

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
    fechaCierre: "",
    tiempoParada: "",
  });
  fotos.value = [];
  audioUrl.value = null;
  audioBlob.value = null;
};

// Envío del formulario
const onSubmit = async () => {
  try {
    if (fotos.value.length === 0) {
      toast.add({ title: "Debe subir al menos una foto", color: "error" });
      return;
    }

    if (!audioBlob.value) {
      toast.add({ title: "Debe grabar un audio", color: "error" });
      return;
    }

    const formData = new FormData();

    formData.append(
      "incidencia",
      new Blob(
        [
          JSON.stringify({
            ...state,
            tipoIncidenciaId: parseInt(state.tipoIncidenciaId),
            estadoId: parseInt(state.estadoId),
            maquinaId: state.maquinaId ? parseInt(state.maquinaId) : null,
            ordenId: state.ordenId ? parseInt(state.ordenId) : null,
            estacionId: state.estacionId ? parseInt(state.estacionId) : null,
          }),
        ],
        { type: "application/json" },
      ),
    );

    fotos.value.forEach((f) => formData.append("archivos", f));
    formData.append(
      "archivos",
      new File([audioBlob.value], "grabacion.webm", { type: "audio/webm" }),
    );

    await $fetch("/api/incidencias/con-archivos", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    toast.add({ title: "Incidencia creada exitosamente", color: "success" });
    emit("creada");
    resetForm();
    open.value = false;
  } catch (err: unknown) {
    const error = err as { data?: { message?: string }; message?: string };
    toast.add({
      title: "Error al crear la incidencia",
      description: error.data?.message || error.message,
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
          <UInput
            v-model="state.fechaCierre"
            type="datetime-local"
            class="w-full"
          />
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

        <!-- FOTOS -->
        <UFormField label="Fotos (mínimo 1)">
          <UFileUpload
            v-model="fotos"
            accept="image/*"
            layout="list"
            multiple
            label="Arrastra o selecciona tus fotos"
            description="JPG, PNG o WebP — máximo 2 MB cada una"
            class="w-full min-h-40"
          >
            <!-- Botón personalizado -->
            <template #actions="{ open: openFileDialog }">
              <UButton
                label="Seleccionar imágenes"
                icon="i-lucide-upload"
                color="neutral"
                variant="outline"
                @click="openFileDialog()"
              />
            </template>

            <!-- Vista previa de imágenes -->
            <template #files-bottom="{ files }">
              <div v-if="files?.length" class="grid grid-cols-3 gap-3 mt-4">
                <div
                  v-for="(file, i) in files"
                  :key="file.name"
                  class="relative rounded-lg border p-1 bg-neutral-50 dark:bg-neutral-900"
                >
                  <NuxtImg
                    :src="file.url"
                    class="w-full h-24 object-cover rounded-md"
                    :alt="file.name"
                  />
                  <UButton
                    icon="i-heroicons-x-mark-20-solid"
                    color="red"
                    variant="ghost"
                    size="xs"
                    class="absolute top-0 right-0"
                    @click="removeFoto(i)"
                  />
                </div>
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
        :disabled="fotos.length === 0 || !audioBlob"
      />
    </template>
  </UModal>
</template>
