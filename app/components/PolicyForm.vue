<script setup lang="ts">
import { reactive, computed } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

// --- Type Definitions ---
interface Role {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  description?: string;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

// --- Zod Schema for Validation ---
const schema = z.object({
  roleId: z.number("Debe seleccionar un rol." ),
  tagId: z.number("Debe seleccionar un tag." ),
  permissionId: z.number( "Debe seleccionar un permiso." ),
});

type Schema = z.output<typeof schema>;

// --------------------

const emit = defineEmits<{
  (e: "save", payload: Schema): void;
}>();

// Fetch data for dropdowns
const { data: roles } = useAsyncData<Role[]>("form-roles", () => $fetch("http://localhost:8080/api/roles"));
const { data: tags } = useAsyncData<Tag[]>("form-tags", () => $fetch("http://localhost:8080/api/tags"));
const { data: permissions } = useAsyncData<Permission[]>("form-permissions", () => $fetch("http://localhost:8080/api/permissions"));

const roleOptions = computed(() => roles.value?.map(r => ({ label: r.name, value: r.id })) || []);
const tagOptions = computed(() => tags.value?.map(t => ({ label: t.name, value: t.id })) || []);
const permissionOptions = computed(() => permissions.value?.map(p => ({ label: p.name, value: p.id })) || []);

const initialState = {
  roleId: undefined,
  tagId: undefined,
  permissionId: undefined,
};

const state = reactive({ ...initialState });

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit("save", event.data);
}
</script>

<template>
  <UForm
    id="policy-form"
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Rol" name="roleId">
      <USelect
        v-model="state.roleId"
        :options="roleOptions"
        placeholder="Selecciona un rol"
        value-attribute="value"
        option-attribute="label"
      />
    </UFormField>

    <UFormField label="Tag" name="tagId">
      <USelect
        v-model="state.tagId"
        :options="tagOptions"
        placeholder="Selecciona un tag"
        value-attribute="value"
        option-attribute="label"
      />
    </UFormField>

    <UFormField label="Permiso" name="permissionId">
      <USelect
        v-model="state.permissionId"
        :options="permissionOptions"
        placeholder="Selecciona un permiso"
        value-attribute="value"
        option-attribute="label"
      />
    </UFormField>
  </UForm>
</template>