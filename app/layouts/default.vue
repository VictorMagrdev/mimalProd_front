<template>
  <div>
    <aside
      class="w-64 h-screen bg-muted border-r border-muted p-4 fixed overflow-y-auto flex flex-col"
    >
      <div class="flex flex-col items-center mb-6">
        <UDropdownMenu :items="dropdownItems">
          <UButton circle>
            <UAvatar :src="avatarUrl" />
          </UButton>
        </UDropdownMenu>
      </div>

      <nav class="space-y-4 flex-1">
        <ULink
          v-for="link in mainLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2 px-3 py-2 rounded text-default hover:bg-accented transition"
          active-class="bg-accented font-semibold"
        >
          <UIcon :name="link.icon" class="w-5 h-5" />
          <span>{{ link.label }}</span>
        </ULink>

        <UTree :items="treeItems" />
      </nav>
    </aside>
    <main class="ml-64 p-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ref } from "vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const avatarUrl = ref("app/assets/user_527489.png");

const mainLinks = [{ label: "Inicio", to: "/", icon: "i-heroicons-home" }];

const treeItems = [
  {
    label: "Usuarios",
    defaultExpanded: route.path.startsWith("/usuarios"),
    children: [
      {
        label: "Listado",
        icon: "i-heroicons-list-bullet",
        value: "/usuarios",
        onSelect: () => router.push("/usuarios"),
      },
      {
        label: "Roles",
        icon: "i-heroicons-plus-circle",
        value: "/usuarios/roles",
        onSelect: () => router.push("/usuarios/roles"),
      },
      {
        label: "Políticas",
        icon: "i-heroicons-plus-circle",
        value: "/usuarios/politicas",
        onSelect: () => router.push("/usuarios/politicas"),
      },
    ],
  },
];

const dropdownItems = ref([
  [
    {
      label: "Cerrar sesión",
      icon: "i-heroicons-logout",
      onSelect: () => {
        auth.logout();
        router.push("/");
      },
    },
  ],
]);
</script>
