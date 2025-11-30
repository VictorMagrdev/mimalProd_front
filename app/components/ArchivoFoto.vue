<!-- components/ArchivoFoto.vue -->
<template>
  <div class="border rounded-lg overflow-hidden shadow-sm flex flex-col">
    <!-- Imagen -->
    <img
      :src="archivo.url"
      :alt="archivo.nombreOriginal"
      class="w-full h-32 object-cover"
    />

    <!-- Nombre y botón descargar -->
    <div class="p-2 flex justify-between items-center">
      <span class="text-sm text-gray-700 truncate">{{
        archivo.nombreOriginal
      }}</span>
      <UButton
        icon="i-heroicons-arrow-down-tray"
        size="sm"
        variant="outline"
        color="neutral"
        @click="$emit('descargar', archivo)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Archivo } from "~/utils/types";
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  archivo: Archivo;
}>();

const emit = defineEmits<{
  (e: "descargar", archivo: Archivo): void;
}>();
</script>

<style scoped>
/* Opcional: efecto hover */
img:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}
</style>
