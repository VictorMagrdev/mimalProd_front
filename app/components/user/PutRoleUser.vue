<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, defineEmits, defineProps, reactive, ref, watch } from "vue";

interface Role {
  id: number;
  nombre: string;
}

const props = defineProps<{
  userId: number | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const auth = useAuthStore();
const error = ref<string | null>(null);

const state = reactive({
  roleId: undefined as number | undefined,
});

function resetForm() {
  state.roleId = undefined;
}

const toast = useToast();
const roles = ref<Role[]>([]);

const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.nombre, id: r.id })),
);

async function fetchRoles() {
  try {
    roles.value = await $fetch<Role[]>(
      "https://engagement-roommate-martha-brunette.trycloudflare.com/api/roles",
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
  } catch (err) {
    toast.add({ title: "Error", description: String(err), color: "error" });
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) fetchRoles();
    else resetForm();
  },
  { immediate: true },
);

async function onSubmit() {
  error.value = null;

  if (!props.userId) return;

  try {
    await $fetch(
      `https://engagement-roommate-martha-brunette.trycloudflare.com/api/users/${props.userId}/roles`,
      {
        method: "POST",
        body: { roleId: state.roleId },
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    toast.add({
      title: "Rol asignado",
      description: "El rol fue asignado correctamente al usuario",
      color: "success",
    });

    resetForm();
  } catch (err) {
    toast.add({ title: "Error", description: String(err), color: "error" });
  }
}
</script>

<template>
  <UModal :open="props.open" title="Actualizar usuario" @close="emit('close')">
    <template #description>
      Selecciona un rol para asignar al usuario.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="assignRoleForm"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Rol" name="roleId">
          <USelectMenu
            v-model="state.roleId"
            value-key="id"
            :items="roleOptions"
            class="w-full"
            placeholder="Selecciona un rol"
          />
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
        label="Asignar rol"
        type="submit"
        color="neutral"
        form="assignRoleForm"
      />
    </template>
  </UModal>
</template>
