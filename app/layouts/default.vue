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
        icon: "i-heroicons-user-group",
        value: "/usuarios/roles",
        onSelect: () => router.push("/usuarios/roles"),
      },
      {
        label: "Políticas",
        icon: "i-heroicons-shield-check",
        value: "/usuarios/politicas",
        onSelect: () => router.push("/usuarios/politicas"),
      },
    ],
  },
  {
    label: "Producción",
    defaultExpanded:
      route.path.startsWith("/ordenes-produccion") ||
      route.path.startsWith("/lineas-orden") ||
      route.path.startsWith("/lotes-produccion") ||
      route.path.startsWith("/costos-orden"),
    children: [
      {
        label: "Órdenes",
        icon: "i-heroicons-clipboard-document-list",
        value: "/ordenes-produccion",
        onSelect: () => router.push("/ordenes-produccion"),
      },
      {
        label: "Líneas de Orden",
        icon: "i-heroicons-bars-3",
        value: "/lineas-orden",
        onSelect: () => router.push("/lineas-orden"),
      },
      {
        label: "Lotes",
        icon: "i-heroicons-archive-box",
        value: "/lotes-produccion",
        onSelect: () => router.push("/lotes-produccion"),
      },
      {
        label: "Costos",
        icon: "i-heroicons-currency-dollar",
        value: "/costos-orden",
        onSelect: () => router.push("/costos-orden"),
      },
      {
        label: "Bodegas",
        icon: "i-heroicons-building-storefront",
        value: "/bodegas",
        onSelect: () => router.push("/bodegas"),
      },
      {
        label: "Conteo Cíclico",
        icon: "i-heroicons-check-circle",
        value: "/conteo-ciclico",
        onSelect: () => router.push("/conteo-ciclico"),
      },
      {
        label: "Discrepancia Inventario",
        icon: "i-heroicons-exclamation-triangle",
        value: "/discrepancia-inventario",
        onSelect: () => router.push("/discrepancia-inventario"),
      },
      {
        label: "Inventario Lote",
        icon: "i-heroicons-archive-box",
        value: "/inventario-lote",
        onSelect: () => router.push("/inventario-lote"),
      },
      {
        label: "Movimientos Inventario",
        icon: "i-heroicons-arrow-path",
        value: "/movimientos-inventario",
        onSelect: () => router.push("/movimientos-inventario"),
      },
      {
        label: "Orden Estación",
        icon: "i-heroicons-rectangle-stack",
        value: "/orden-estacion",
        onSelect: () => router.push("/orden-estacion"),
      },
      {
        label: "Orden Evento",
        icon: "i-heroicons-calendar",
        value: "/orden-evento",
        onSelect: () => router.push("/orden-evento"),
      },
      {
        label: "Método de Valoración",
        icon: "i-heroicons-scale",
        value: "/metodo-valoracion",
        onSelect: () => router.push("/metodo-valoracion"),
      },
      {
        label: "Reserva Material Orden",
        icon: "i-heroicons-inbox",
        value: "/reserva-material-orden",
        onSelect: () => router.push("/reserva-material-orden"),
      },
      {
        label: "Punto Reorden",
        icon: "i-heroicons-flag",
        value: "/punto-reorden",
        onSelect: () => router.push("/punto-reorden"),
      },
      {
        label: "Estación Producción",
        icon: "i-heroicons-cog-6-tooth",
        value: "/estacion-produccion",
        onSelect: () => router.push("/estacion-produccion"),
      },
    ],
  },
  {
    label: "Catálogos",
    defaultExpanded:
      route.path.startsWith("/productos") ||
      route.path.startsWith("/estados-orden") ||
      route.path.startsWith("/tipos-costo"),
    children: [
      {
        label: "Productos",
        icon: "i-heroicons-cube",
        value: "/productos",
        onSelect: () => router.push("/productos"),
      },
      {
        label: "Estados de Orden",
        icon: "i-heroicons-tag",
        value: "/estados-orden",
        onSelect: () => router.push("/estados-orden"),
      },
      {
        label: "Tipos de Costo",
        icon: "i-heroicons-tag",
        value: "/tipos-costo",
        onSelect: () => router.push("/tipos-costo"),
      },
      {
        label: "Tipos de Bodega",
        icon: "i-heroicons-building-library",
        value: "/tipos-bodega",
        onSelect: () => router.push("/tipos-bodega"),
      },
      {
        label: "Tipos de Movimientos",
        icon: "i-heroicons-arrows-right-left",
        value: "/tipos-movimientos",
        onSelect: () => router.push("/tipos-movimientos"),
      },
      {
        label: "Tipos de Producto",
        icon: "i-heroicons-cube",
        value: "/tipos-producto",
        onSelect: () => router.push("/tipos-producto"),
      },
    ],
  },
  {
    label: "Configuración",
    defaultExpanded:
      route.path.startsWith("/unidades-medida") ||
      route.path.startsWith("/unidades-medida-tipo") ||
      route.path.startsWith("/unidades-conversion"),
    children: [
      {
        label: "Unidades de Medida",
        icon: "i-heroicons-scale",
        value: "/unidades-medida",
        onSelect: () => router.push("/unidades-medida"),
      },
      {
        label: "Tipos de Unidad",
        icon: "i-heroicons-swatch",
        value: "/unidades-medida-tipo",
        onSelect: () => router.push("/unidades-medida-tipo"),
      },
      {
        label: "Conversiones",
        icon: "i-heroicons-arrows-right-left",
        value: "/unidades-conversion",
        onSelect: () => router.push("/unidades-conversion"),
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
