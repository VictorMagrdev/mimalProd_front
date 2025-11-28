<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";
import type { Role } from "~/utils/types";

const auth = useAuthStore();
const open = ref(false);
const roles = ref<Role[]>([]);
const centrosCosto = ref<CentrosCosto[]>([]);
export interface CentrosCosto {
  id: number;
  codigo: string;
  nombre: string;
}
const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.name, id: r.id.toString() })),
);
const centrosCostoOptions = computed(() =>
  centrosCosto.value.map((r) => ({ label: r.nombre, id: r.id.toString() })),
);
const emit = defineEmits<{ (e: "creado"): void }>();
watch(open, async (isOpen) => {
  if (isOpen && roles.value.length === 0) {
    try {
      const rolesRes = await $fetch<Role[]>("http://localhost:8080/api/roles", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      roles.value = rolesRes || [];
      const centrosCostoRes = await $fetch<CentrosCosto[]>(
        "http://localhost:8080/api/v1/centros-costo",
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      centrosCosto.value = centrosCostoRes || [];
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  }
});

const UserSchemaInitialState = {
  username: "",
  email: "",
  password: "",
  telefono: "",
  codigoEmpleado: "",
  nombre: "",
  apellidos: "",
  centroCostoId: undefined,
  capacidadHorasDia: "PT8H",
  activo: true,
  roleIds: [] as string[],
};

const state = reactive({ ...UserSchemaInitialState });
const error = ref<string | null>(null);

function resetForm() {
  Object.assign(state, UserSchemaInitialState);
}

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<typeof UserSchemaInitialState>) {
  error.value = null;
  const auth = useAuthStore();

  const payload = {
    ...event.data,
    roleIds: event.data.roleIds.map((id) => Number(id)),
    capacidadHorasDia: `PT${event.data.capacidadHorasDia}H`,
  };

  try {
    await $fetch("http://localhost:8080/api/users", {
      method: "POST",
      body: payload,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    emit("creado");
    toast.add({
      title: "Usuario creado",
      description: `El usuario fue registrado correctamente`,
      color: "success",
    });

    resetForm();
    open.value = false;
  } catch (err) {
    toast.add({
      title: "Error",
      description: String(err),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Crear usuario">
    <template #description>
      Completa el formulario para registrar un nuevo usuario.
    </template>

    <UButton
      class="right-0"
      label="Nuevo usuario"
      color="neutral"
      variant="subtle"
    />

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm id="formId" :state="state" class="space-y-4" @submit="onSubmit">
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

        <UFormField
          label="Contraseña"
          name="password"
          :rules="[
            (v: any) => !!v || 'La contraseña es obligatoria',
            (v: string | any[]) =>
              v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
          ]"
        >
          <UInput
            v-model="state.password"
            class="w-full"
            type="password"
            placeholder="********"
          />
        </UFormField>

        <UFormField label="Activo" name="activo">
          <UCheckbox v-model="state.activo" class="w-full" />
        </UFormField>

        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" class="w-full" />
        </UFormField>

        <UFormField label="Apellidos" name="apellidos">
          <UInput v-model="state.apellidos" class="w-full" />
        </UFormField>

        <UFormField label="Teléfono" name="telefono">
          <UInput v-model="state.telefono" class="w-full" />
        </UFormField>

        <UFormField label="Código empleado" name="codigoEmpleado">
          <UInput v-model="state.codigoEmpleado" class="w-full" />
        </UFormField>

        <UFormField label="Centro de costo" name="centroCostoId">
          <UInputMenu
            v-model="state.centroCostoId"
            :items="centrosCostoOptions"
            value-key="id"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Capacidad horas/día" name="capacidadHorasDia">
          <UInput
            v-model="state.capacidadHorasDia"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Roles" name="roleIds">
          <UInputMenu
            v-model="state.roleIds"
            :items="roleOptions"
            value-key="id"
            multiple
            class="w-full"
            placeholder="Selecciona uno o varios roles"
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
        label="Crear usuario"
        type="submit"
        color="neutral"
        form="formId"
      />
    </template>
  </UModal>
</template>
