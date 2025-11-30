<script setup lang="ts">
import { useArrayFilter } from "@vueuse/core";
import { computed } from "vue";
import type { Archivo, Incidencia } from "~/utils/types";

const route = useRoute();
const incidenciaId = route.params.id as string;

const GET_INCIDENCIA = gql`
  query GetIncidencia($id: ID!) {
    incidencia(id: $id) {
      id
      codigo
      titulo
      descripcion
      tipoIncidenciaId
      estadoId
      maquinaId
      creadoEn
      archivos {
        id
        tipo
        nombreOriginal
        url
      }
    }
  }
`;

const { data, pending } = await useAsyncQuery<{ incidencia: Incidencia }>(
  GET_INCIDENCIA,
  { id: incidenciaId },
);

const incidencia = computed(() => data.value?.incidencia ?? null);

const archivosFoto = useArrayFilter(
  () => incidencia.value?.archivos ?? [],
  (a) => a.tipo === "FOTO",
);

const archivosAudio = useArrayFilter(
  () => incidencia.value?.archivos ?? [],
  (a) => a.tipo === "AUDIO",
);

function useDownloadFile(url: string, filename?: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "archivo";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const descargarArchivo = (archivo: Archivo) => {
  useDownloadFile(archivo.url, archivo.nombreOriginal);
};
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">{{ incidencia?.titulo }}</h1>
          <UBadge
            :color="incidencia?.estadoId === 'Resuelta' ? 'success' : 'warning'"
          >
            {{ incidencia?.estadoId || "Pendiente" }}
          </UBadge>
        </div>
      </template>

      <!-- Loader -->
      <div v-if="pending" class="flex justify-center py-10">
        <div>Cargando...</div>
      </div>

      <!-- Contenido -->
      <div v-else-if="incidencia" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Reemplazo de UDescription -->
          <div class="flex flex-col">
            <span class="text-sm text-gray-500">Código</span>
            <span class="font-medium">{{ incidencia.codigo }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-gray-500">Tipo</span>
            <span class="font-medium">{{
              incidencia.tipoIncidenciaId || "N/A"
            }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-gray-500">Máquina</span>
            <span class="font-medium">{{ incidencia.maquinaId || "N/A" }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-gray-500">Creado</span>
            <span class="font-medium">{{
              new Date(incidencia.creadoEn).toLocaleString()
            }}</span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Descripción</span>
          <span class="font-medium">{{
            incidencia.descripcion || "Sin descripción"
          }}</span>
        </div>

        <!-- Archivos -->
        <div v-if="incidencia?.archivos?.length">
          <label class="text-sm font-medium text-gray-500 mb-2 block">
            Archivos adjuntos
          </label>

          <!-- Fotos -->
          <div
            v-if="incidencia.archivos.some((a) => a?.tipo === 'FOTO')"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            <div v-if="archivosFoto.length">
              <label class="text-sm font-medium text-gray-500 mb-2 block">
                Fotografías
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <ArchivoFoto
                  v-for="a in archivosFoto"
                  :key="a.id"
                  :archivo="a"
                  @descargar="descargarArchivo"
                />
              </div>
            </div>
          </div>

          <!-- Audios -->
          <div v-if="archivosAudio.length" class="mt-6 space-y-4">
            <div
              v-for="archivo in archivosAudio"
              :key="archivo.id"
              class="p-4 border rounded-lg flex flex-col items-center gap-2"
            >
              <audio controls class="w-full">
                <source :src="archivo.url" type="audio/webm" />
                Tu navegador no soporta el elemento de audio.
              </audio>

              <div class="flex justify-between w-full items-center">
                <span class="text-sm text-gray-600 truncate">
                  {{ archivo.nombreOriginal }}
                </span>
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="descargarArchivo(archivo)"
                >
                  Descargar
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500 text-center py-10">
        No se encontró la incidencia.
      </div>
    </UCard>
  </div>
</template>
