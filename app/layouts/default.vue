<template>
  <div>
    <aside
      class="w-64 h-screen bg-muted border-r border-muted p-4 fixed overflow-y-auto flex flex-col"
    >
      <div class="flex flex-col items-center mb-6">
        <UDropdown :items="dropdownItems" :popper="{ placement: 'bottom-start' }">
          <UAvatar :src="avatarUrl" size="lg" />
        </UDropdown>
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
        to: "/usuarios",
      },
      {
        label: "Roles",
        icon: "i-heroicons-user-group",
        to: "/usuarios/roles",
      },
      {
        label: "Políticas",
        icon: "i-heroicons-shield-check",
        to: "/usuarios/politicas",
      },
    ],
  },
  {
    label: "Producción",
    defaultExpanded: route.path.startsWith('/ordenes-produccion') || route.path.startsWith('/lineas-orden') || route.path.startsWith('/lotes-produccion') || route.path.startsWith('/costos-orden'),
    children: [
      { label: "Órdenes", icon: "i-heroicons-clipboard-document-list", to: "/ordenes-produccion" },
      { label: "Líneas de Orden", icon: "i-heroicons-bars-3", to: "/lineas-orden" },
      { label: "Lotes", icon: "i-heroicons-archive-box", to: "/lotes-produccion" },
      { label: "Costos", icon: "i-heroicons-currency-dollar", to: "/costos-orden" },
    ],
  },
  {
    label: "Catálogos",
    defaultExpanded: route.path.startsWith('/productos') || route.path.startsWith('/estados-orden') || route.path.startsWith('/tipos-costo'),
    children: [
      { label: "Productos", icon: "i-heroicons-cube", to: "/productos" },
      { label: "Estados de Orden", icon: "i-heroicons-tag", to: "/estados-orden" },
      { label: "Tipos de Costo", icon: "i-heroicons-tag", to: "/tipos-costo" },
    ],
  },
  {
    label: "Configuración",
    defaultExpanded: route.path.startsWith('/unidades-medida') || route.path.startsWith('/unidades-medida-tipo') || route.path.startsWith('/unidades-conversion'),
    children: [
      { label: "Unidades de Medida", icon: "i-heroicons-scale", to: "/unidades-medida" },
      { label: "Tipos de Unidad", icon: "i-heroicons-swatch", to: "/unidades-medida-tipo" },
      { label: "Conversiones", icon: "i-heroicons-arrows-right-left", to: "/unidades-conversion" },
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
