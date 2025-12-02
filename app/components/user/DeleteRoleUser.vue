<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, defineEmits, defineProps, reactive, ref, watch } from "vue";

interface Role {
  id: number;
  name: string;
}

const auth = useAuthStore();
const error = ref<string | null>(null);

const props = defineProps<{
  userId: number | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const state = reactive({
  roleId: undefined as number | undefined,
});

function resetForm() {
  state.roleId = undefined;
}

const toast = useToast();
const roles = ref<Role[]>([]);
const roleOptions = computed(() =>
  roles.value.map((r) => ({ label: r.name, id: r.id })),
);

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.userId) {
      try {
        const rolesRes = await $fetch<Role[]>(
          `https://engagement-roommate-martha-brunette.trycloudflare.com/api/users/${props.userId}/roles`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          },
        );

        roles.value = rolesRes || [];
        console.log(roles.value);
      } catch (err) {
        toast.add({ title: "Error", description: String(err), color: "error" });
      }
    }
  },
  { immediate: true },
);

async function onSubmit() {
  error.value = null;

  if (!props.userId || !state.roleId) return;

  try {
    await $fetch(
      `https://engagement-roommate-martha-brunette.trycloudflare.com/api/users/${props.userId}/roles/${state.roleId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    toast.add({
      title: "Rol quitado",
      description: "El rol fue quitado correctamente al usuario",
      color: "success",
    });

    resetForm();
  } catch (err) {
    toast.add({ title: "Error", description: String(err), color: "error" });
  }
}
</script>

<template>
  <UModal :open="props.open" title="quitar rol" @close="emit('close')">
    <template #description>
      Selecciona un rol para quitar al usuario.
    </template>

    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

    <template #body>
      <UForm
        id="removeRoleForm"
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
        label="Quitar rol"
        type="submit"
        color="neutral"
        form="removeRoleForm"
      />
    </template>
  </UModal>
</template>
