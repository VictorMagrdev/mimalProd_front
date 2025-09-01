<template>
  <div>
    <aside
      class="w-64 h-screen bg-muted border-r border-muted p-4 fixed overflow-y-auto"
    >
      <nav class="space-y-4">
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

const router = useRouter();
const route = useRoute();

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
        label: "Politicas",
        icon: "i-heroicons-plus-circle",
        value: "/usuarios/politicas",
        onSelect: () => router.push("/usuarios/politicas"),
      },
    ],
  }
];
</script>

