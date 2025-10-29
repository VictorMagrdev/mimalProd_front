<script setup>
import { ref, onUnmounted } from "vue";
import { useToast } from "#imports";

const toast = useToast();

const isRecording = ref(false);
const audioUrl = ref(null);
const mediaRecorder = ref(null);
const chunks = ref([]);
const timer = ref(0);
let intervalId = null;

const MAX_SECONDS = 120;
const resetRecording = () => {
  stopRecording();
  audioUrl.value = null;
  chunks.value = [];
  timer.value = 0;
  toast.add({
    title: "Reinicio",
    description: "Grabación reiniciada.",
    color: "orange",
  });
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    chunks.value = [];

    mediaRecorder.value.ondataavailable = (e) => chunks.value.push(e.data);
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(chunks.value, { type: "audio/webm" });
      audioUrl.value = URL.createObjectURL(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    timer.value = 0;

    intervalId = setInterval(() => {
      timer.value++;
      if (timer.value >= MAX_SECONDS) stopRecording();
    }, 1000);
  } catch (err) {
    toast.add({ title: "Error", description: string(err), color: "red" });
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== "inactive") {
    mediaRecorder.value.stop();
  }
  isRecording.value = false;
  clearInterval(intervalId);
};

onUnmounted(() => clearInterval(intervalId));
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
        :color="isRecording ? 'red' : 'green'"
        :icon="
          isRecording ? 'i-heroicons-stop-circle' : 'i-heroicons-microphone'
        "
        :label="isRecording ? 'Detener grabación' : 'Iniciar grabación'"
        @click="isRecording ? stopRecording() : startRecording()"
      />

      <div class="w-full">
        <UProgress
          v-if="isRecording"
          :value="(timer / MAX_SECONDS) * 100"
          color="primary"
          class="h-2 mb-1"
        />
        <p v-if="isRecording" class="text-sm text-center text-gray-500">
          Grabando... {{ timer }}s
        </p>
      </div>

      <audio
        v-if="audioUrl"
        :src="audioUrl"
        controls
        class="w-full rounded-lg"
      />
      <UButton
        label="Regrabar"
        color="yellow"
        icon="i-heroicons-arrow-path"
        @click="resetRecording"
      />
    </div>

    <template v-if="audioUrl" #footer>
      <div class="text-sm text-gray-500">
        Grabación lista — se incluirá en el formulario.
      </div>
      <input type="hidden" name="audio" :value="audioUrl" />
    </template>
  </UCard>
</template>
