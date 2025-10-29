<script setup lang="ts">
import { gql } from "graphql-tag";
import { computed } from "vue";

interface Archivo {
  id: string;
  tipo: "FOTO" | "AUDIO";
  nombreOriginal: string;
  url: string;
  incidenciaId: string;
}

interface Incidencia {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipoIncidenciaId?: string;
  estadoId?: string;
  maquinaId?: string;
  creadoEn: string;
  archivos: Archivo[];
}

const route = useRoute();
const incidenciaId = route.params.id as string;

// Queries
const GET_TODAS_INCIDENCIAS = gql`
  query GetTodasIncidencias {
    incidencias {
      id
      codigo
      titulo
      descripcion
      tipoIncidenciaId
      estadoId
      maquinaId
      creadoEn
    }
  }
`;

const GET_TODOS_ARCHIVOS = gql`
  query GetTodosArchivos {
    incidenciasArchivo {
      id
      incidenciaId
      tipo
      nombreOriginal
      url
    }
  }
`;

// Requests
const { data: dataIncidencias, pending: pendingIncidencias } =
  await useAsyncQuery<{ incidencias: Omit<Incidencia, "archivos">[] }>(
    GET_TODAS_INCIDENCIAS,
  );
const { data: dataArchivos, pending: pendingArchivos } = await useAsyncQuery<{
  incidenciasArchivo: Archivo[];
}>(GET_TODOS_ARCHIVOS);

// Filtramos la incidencia y sus archivos
const incidencia = computed<Incidencia | null>(() => {
  const inc = dataIncidencias.value?.incidencias.find(
    (i) => i.id === incidenciaId,
  );
  if (!inc) return null;

  return {
    ...inc,
    archivos:
      dataArchivos.value?.incidenciasArchivo.filter(
        (a) => a.incidenciaId === incidenciaId && a.id,
      ) || [],
  };
});

const pending = computed(
  () => pendingIncidencias.value || pendingArchivos.value,
);

// Función para descargar archivos
const descargarArchivo = (archivo: Archivo) => {
  const a = document.createElement("a");
  a.href = archivo.url;
  a.download = archivo.nombreOriginal;
  a.click();
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
        <ULoader size="lg" color="primary" />
      </div>

      <!-- Contenido -->
      <div v-else-if="incidencia" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <UDescription label="Código" :value="incidencia.codigo" />
          <UDescription
            label="Tipo"
            :value="incidencia.tipoIncidenciaId || 'N/A'"
          />
          <UDescription
            label="Máquina"
            :value="incidencia.maquinaId || 'N/A'"
          />
          <UDescription
            label="Creado"
            :value="new Date(incidencia.creadoEn).toLocaleString()"
          />
        </div>

        <UDescription
          label="Descripción"
          :value="incidencia.descripcion || 'Sin descripción'"
        />

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
            <div
              v-for="archivo in incidencia.archivos.filter(
                (a) => a?.tipo === 'FOTO',
              ) || []"
              :key="archivo.id"
              class="relative group border rounded-lg overflow-hidden"
            >
              <img
                :src="archivo.url"
                :alt="archivo.nombreOriginal"
                class="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  size="sm"
                  color="white"
                  variant="solid"
                  @click="descargarArchivo(archivo)"
                >
                  Descargar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Audios -->
          <div
            v-if="incidencia.archivos.some((a) => a?.tipo === 'AUDIO')"
            class="mt-6 space-y-4"
          >
            <div
              v-for="archivo in incidencia.archivos.filter(
                (a) => a?.tipo === 'AUDIO',
              ) || []"
              :key="archivo.id"
              class="p-4 border rounded-lg flex flex-col items-center gap-2"
            >
              <audio controls class="w-full">
                <source :src="archivo.url" type="audio/webm" />
                Tu navegador no soporta el elemento de audio.
              </audio>
              <div class="flex justify-between w-full items-center">
                <span class="text-sm text-gray-600 truncate">{{
                  archivo.nombreOriginal
                }}</span>
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
