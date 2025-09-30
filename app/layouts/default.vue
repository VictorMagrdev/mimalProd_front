<template>
  <div>
    <aside
      class="w-64 h-screen bg-muted border-r border-muted p-4 fixed overflow-y-auto flex flex-col"
    >
      <!-- Avatar dropdown -->
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

        <!-- Tree -->
        <UTree
          v-model:expanded="expandedKeys"
          :items="treeItems"
          :get-key="(i:any) => i.value"
        />
      </nav>
    </aside>

    <main class="ml-64 p-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import avatarUrl from "@/assets/user_527489.png";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const navigate = (path: string) => router.push(path);

const mainLinks = [{ label: "Inicio", to: "/", icon: "i-heroicons-home" }];

const expandedKeys = ref<string[]>([]);

watchEffect(() => {
  const keysToExpand: string[] = [];

  if (route.path.startsWith("/usuarios")) keysToExpand.push("usuarios");
  if (
    route.path.startsWith("/ordenes-produccion") ||
    route.path.startsWith("/lineas-orden") ||
    route.path.startsWith("/lotes-produccion") ||
    route.path.startsWith("/costos-orden")
  )
    keysToExpand.push("produccion");
  if (
    route.path.startsWith("/productos") ||
    route.path.startsWith("/estados-orden") ||
    route.path.startsWith("/tipos-costo")
  )
    keysToExpand.push("catalogos");
  if (
    route.path.startsWith("/unidades-medida") ||
    route.path.startsWith("/unidades-medida-tipo") ||
    route.path.startsWith("/unidades-conversion")
  )
    keysToExpand.push("configuracion");

  // Combina con los previamente expandidos sin duplicados
  expandedKeys.value = Array.from(
    new Set([...expandedKeys.value, ...keysToExpand]),
  );
});

// Dropdown
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

const treeItems = ref([
  {
    label: "Usuarios",
    value: "usuarios",
    children: [
      {
        label: "Listado",
        value: "/usuarios",
        onSelect: () => navigate("/usuarios"),
        icon: "i-heroicons-list-bullet",
      },
      {
        label: "Roles",
        value: "/usuarios/roles",
        onSelect: () => navigate("/usuarios/roles"),
        icon: "i-heroicons-user-group",
      },
      {
        label: "Políticas",
        value: "/usuarios/politicas",
        onSelect: () => navigate("/usuarios/politicas"),
        icon: "i-heroicons-shield-check",
      },
    ],
  },
  {
    label: "Producción",
    value: "produccion",
    children: [
      {
        label: "Órdenes",
        value: "/ordenes-produccion",
        onSelect: () => navigate("/ordenes-produccion"),
        icon: "i-heroicons-clipboard-document-list",
      },
      {
        label: "Líneas de Orden",
        value: "/lineas-orden",
        onSelect: () => navigate("/lineas-orden"),
        icon: "i-heroicons-bars-3",
      },
      {
        label: "Lotes",
        value: "/lotes-produccion",
        onSelect: () => navigate("/lotes-produccion"),
        icon: "i-heroicons-archive-box",
      },
      {
        label: "Costos",
        value: "/costos-orden",
        onSelect: () => navigate("/costos-orden"),
        icon: "i-heroicons-currency-dollar",
      },
      {
        label: "Bodegas",
        value: "/bodegas",
        onSelect: () => navigate("/bodegas"),
        icon: "i-heroicons-building-storefront",
      },
      {
        label: "Conteo Cíclico",
        value: "/conteo-ciclico",
        onSelect: () => navigate("/conteo-ciclico"),
        icon: "i-heroicons-check-circle",
      },
      {
        label: "Discrepancia Inventario",
        value: "/discrepancia-inventario",
        onSelect: () => navigate("/discrepancia-inventario"),
        icon: "i-heroicons-exclamation-triangle",
      },
      {
        label: "Inventario Lote",
        value: "/inventario-lote",
        onSelect: () => navigate("/inventario-lote"),
        icon: "i-heroicons-archive-box",
      },
      {
        label: "Movimientos Inventario",
        value: "/movimientos-inventario",
        onSelect: () => navigate("/movimientos-inventario"),
        icon: "i-heroicons-arrow-path",
      },
      {
        label: "Orden Estación",
        value: "/orden-estacion",
        onSelect: () => navigate("/orden-estacion"),
        icon: "i-heroicons-rectangle-stack",
      },
      {
        label: "Orden Evento",
        value: "/orden-evento",
        onSelect: () => navigate("/orden-evento"),
        icon: "i-heroicons-calendar",
      },
      {
        label: "Método de Valoración",
        value: "/metodo-valoracion",
        onSelect: () => navigate("/metodo-valoracion"),
        icon: "i-heroicons-scale",
      },
      {
        label: "Reserva Material Orden",
        value: "/reserva-material-orden",
        onSelect: () => navigate("/reserva-material-orden"),
        icon: "i-heroicons-inbox",
      },
      {
        label: "Punto Reorden",
        value: "/punto-reorden",
        onSelect: () => navigate("/punto-reorden"),
        icon: "i-heroicons-flag",
      },
      {
        label: "Estación Producción",
        value: "/estacion-produccion",
        onSelect: () => navigate("/estacion-produccion"),
        icon: "i-heroicons-cog-6-tooth",
      },
    ],
  },
  {
    label: "Catálogos",
    value: "catalogos",
    children: [
      {
        label: "Productos",
        value: "/productos",
        onSelect: () => navigate("/productos"),
        icon: "i-heroicons-cube",
      },
      {
        label: "Estados de Orden",
        value: "/estados-orden",
        onSelect: () => navigate("/estados-orden"),
        icon: "i-heroicons-tag",
      },
      {
        label: "Tipos de Costo",
        value: "/tipos-costo",
        onSelect: () => navigate("/tipos-costo"),
        icon: "i-heroicons-tag",
      },
      {
        label: "Tipos de Bodega",
        value: "/tipos-bodega",
        onSelect: () => navigate("/tipos-bodega"),
        icon: "i-heroicons-building-library",
      },
      {
        label: "Tipos de Movimientos",
        value: "/tipos-movimientos",
        onSelect: () => navigate("/tipos-movimientos"),
        icon: "i-heroicons-arrows-right-left",
      },
      {
        label: "Tipos de Producto",
        value: "/tipos-producto",
        onSelect: () => navigate("/tipos-producto"),
        icon: "i-heroicons-cube",
      },
    ],
  },
  {
    label: "Configuración",
    value: "configuracion",
    children: [
      {
        label: "Unidades de Medida",
        value: "/unidades-medida",
        onSelect: () => navigate("/unidades-medida"),
        icon: "i-heroicons-scale",
      },
      {
        label: "Tipos de Unidad",
        value: "/unidades-medida-tipo",
        onSelect: () => navigate("/unidades-medida-tipo"),
        icon: "i-heroicons-swatch",
      },
      {
        label: "Conversiones",
        value: "/unidades-conversion",
        onSelect: () => navigate("/unidades-conversion"),
        icon: "i-heroicons-arrows-right-left",
      },
    ],
  },
]);
</script>
