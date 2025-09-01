<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { reactive, watch } from "vue";
import type { RoleUI } from "~/pages/usuarios/roles/index.vue";

const props = defineProps<{
  role?: RoleUI | null;
}>();

const emit = defineEmits(["save"]);

const initialState = {
  name: "",
  description: "",
};

const state = reactive({ ...initialState });

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      state.name = newRole.name;
      state.description = newRole.description || "";
    } else {
      Object.assign(state, initialState);
    }
  },
  { immediate: true }
);

function onSubmit(event: FormSubmitEvent<typeof initialState>) {
  emit("save", event.data);
}
</script>

<template>
  <UForm id="role-form" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Nombre" name="name">
      <UInput v-model="state.name" placeholder="Nombre del rol" />
    </UFormField>

    <UFormField label="Descripción" name="description">
      <UInput v-model="state.description" placeholder="Descripción del rol" />
    </UFormField>
  </UForm>
</template>
