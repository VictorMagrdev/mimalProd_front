<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const schema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type Schema = z.output<typeof schema>;

const fields = [
  {
    name: "username",
    type: "text" as const,
    label: "Nombre de Usuario",
    placeholder: "Ingresa tu nombre de usuario",
    required: true,
    icon: "i-lucide-user",
    autocomplete: "username",
  },
  {
    name: "password",
    type: "password" as const,
    label: "Contraseña",
    placeholder: "Ingresa tu contraseña",
    required: true,
    icon: "i-lucide-lock",
    autocomplete: "current-password",
  },
];

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const result = await authStore.login(
      event.data.username,
      event.data.password,
    );

    if (result) {
      toast.add({
        title: "¡Inicio de sesión exitoso!",
        description: "Bienvenido de vuelta al sistema",
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      toast.add({
        title: "Error de inicio de sesión",
        description: "Nombre de usuario o contraseña incorrectos",
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 500,
      });
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Ocurrió un error inesperado";

    toast.add({
      title: "Error de autenticación",
      description: errorMessage,
      color: "error",
      icon: "i-lucide-alert-triangle",
      duration: 500,
    });
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <UPageCard class="w-full max-w-md shadow-xl">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Bienvenido"
        description="Inicia sesión en tu cuenta para continuar"
        icon="i-lucide-shield-check"
        :submit="{
          label: 'Iniciar Sesión',
          block: true,
          size: 'lg',
          color: 'primary',
          loading: authStore.loading,
        }"
        :loading="authStore.loading"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
