<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  userId: number | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const auth = useAuthStore();

const error = ref<string | null>(null);

interface UserUpdateState {
  username: string;
  email: string;
  password?: string;
  active: boolean;
}

const state = reactive<UserUpdateState>({
  username: "",
  email: "",
  password: "",
  active: true,
});

const toast = useToast();

watch(
  () => props.userId,
  async (newUserId) => {
    if (newUserId) {
      const { data, error: fetchError } = await useFetch<UserUpdateState>(
        `https://api.minimalprod.space/api/users/${newUserId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );

      if (fetchError.value) {
        error.value = fetchError.value.message;
        return;
      }

      if (data.value) {
        Object.assign(state, data.value);
      }
    }
  },
  { immediate: true },
);

function resetForm() {
  state.username = "";
  state.email = "";
  state.password = "";
  state.active = true;
}

async function onSubmit(event: FormSubmitEvent<UserUpdateState>) {
  error.value = null;

  if (!props.userId) return;

  const { error: fetchError } = await useFetch(
    `https://api.minimalprod.space/api/users/${props.userId}`,
    {
      method: "PUT",
      body: event.data,
      headers: { Authorization: `Bearer ${auth.token}` },
    },
  );

  if (fetchError.value) {
    error.value = fetchError.value.message;
    toast.add({
      title: "Error",
      description: fetchError.value.message,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Usuario actualizado",
    description: `El usuario ${state.username} fue actualizado correctamente`,
    color: "success",
  });

  emit("close");
}

async function deactivateUser() {
  if (!props.userId) return;

  const { error: fetchError } = await useFetch(
    `https://api.minimalprod.space/api/users/${props.userId}/deactivate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
    },
  );

  if (fetchError.value) {
    toast.add({
      title: "Error",
      description: fetchError.value.message,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Usuario desactivado",
    description: `El usuario ${state.username} fue desactivado`,
    color: "success",
  });

  emit("close");
}
</script>

<template>
  <UModal :open="props.open" title="Actualizar usuario" @close="emit('close')">
    <template #description>
      Modifica los campos para actualizar la información del usuario.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="updateUserForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Usuario" name="username">
          <UInput
            v-model="state.username"
            class="w-full"
            placeholder="Nombre de usuario"
          />
        </UFormField>

        <UFormField label="Correo" name="email">
          <UInput
            v-model="state.email"
            class="w-full"
            type="email"
            placeholder="correo@ejemplo.com"
          />
        </UFormField>

        <UFormField label="Contraseña" name="password">
          <UInput
            v-model="state.password"
            class="w-full"
            type="password"
            placeholder="Dejar vacío para no cambiar"
          />
        </UFormField>

        <UFormField label="Activo" name="active">
          <UCheckbox v-model="state.active" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            resetForm();
            emit('close');
          }
        "
      />
      <UButton
        label="Actualizar"
        type="submit"
        color="neutral"
        form="updateUserForm"
      />
      <UButton
        label="Desactivar usuario"
        color="error"
        variant="outline"
        @click="deactivateUser"
      />
    </template>
  </UModal>
</template>
