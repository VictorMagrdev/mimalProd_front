<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "#imports";
import { useIntervalFn } from "@vueuse/core";

const toast = useToast();

const isRecording = ref(false);
const audioUrl = ref<string | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const chunks = ref<Blob[]>([]);
const timer = ref(0);

const MAX_SECONDS = 120;

const { pause, resume } = useIntervalFn(
  () => {
    timer.value++;
    if (timer.value >= MAX_SECONDS) stopRecording();
  },
  1000,
  { immediate: false },
);

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    mediaRecorder.value = recorder;
    chunks.value = [];
    timer.value = 0;

    recorder.ondataavailable = (e) => chunks.value.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks.value, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
      audioUrl.value = url;
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    isRecording.value = true;
    resume();
  } catch (err) {
    toast.add({
      title: "Error al grabar",
      description: String(err),
      color: "error",
    });
  }
};

const stopRecording = () => {
  if (!mediaRecorder.value) return;
  if (mediaRecorder.value.state !== "inactive") mediaRecorder.value.stop();

  isRecording.value = false;
  pause();
};

const resetRecording = () => {
  stopRecording();
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  audioUrl.value = null;
  chunks.value = [];
  timer.value = 0;

  toast.add({
    title: "Reinicio",
    description: "Grabación reiniciada.",
    color: "error",
  });
};

watch(isRecording, (active) => {
  if (!active) pause();
});
</script>

<template>
  <UCard class="max-w-md w-full mx-auto">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-microphone" class="text-primary" />
        <span class="font-semibold">Grabar mensaje de voz (máx. 2 min)</span>
      </div>
    </template>

    <div class="flex flex-col items-center gap-4">
      <UButton
        :color="isRecording ? 'warning' : 'success'"
        :icon="
          isRecording ? 'i-heroicons-stop-circle' : 'i-heroicons-microphone'
        "
        :label="isRecording ? 'Detener grabación' : 'Iniciar grabación'"
        @click="isRecording ? stopRecording() : startRecording()"
      />

      <div v-if="isRecording" class="w-full">
        <UProgress
          :value="(timer / MAX_SECONDS) * 100"
          color="primary"
          class="h-2 mb-1"
        />
        <p class="text-sm text-center text-gray-500">
          Grabando... {{ timer }}s
        </p>
      </div>

      <template v-if="audioUrl">
        <audio :src="audioUrl" controls class="w-full rounded-lg" />
        <UButton
          label="Regrabar"
          color="info"
          icon="i-heroicons-arrow-path"
          @click="resetRecording"
        />
      </template>
    </div>

    <template v-if="audioUrl" #footer>
      <div class="text-sm text-gray-500">
        Grabación lista — se incluirá en el formulario.
      </div>
      <input type="hidden" name="audio" :value="audioUrl" />
    </template>
  </UCard>
</template>
