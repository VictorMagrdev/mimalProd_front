<template>
  <UDashboardGroup>
    <UDashboardSidebar
      resizable
      collapsible
      :min-size="15"
      :default-size="18"
      :max-size="25"
      :collapsed-size="4"
      :ui="{
        root: 'bg-muted border-r border-muted',
        body: 'space-y-4',
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-3 w-full">
          <UDropdownMenu
            :items="dropdownItems"
            :popper="{ placement: 'bottom-start' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              :square="collapsed"
              :ui="{ rounded: 'rounded-full' }"
            >
              <UUser
                name="Usuario Sistema"
                description="Administrador"
                :avatar="{
                  src: 'https://i.pravatar.cc/150?u=john-doe',
                  alt: 'Usuario',
                }"
                size="sm"
                :orientation="collapsed ? 'vertical' : 'horizontal'"
              />
            </UButton>
          </UDropdownMenu>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigationItems"
          orientation="vertical"
          :ui="{
            base: 'space-y-1',
            item: {
              base: 'group relative flex items-center gap-2 w-full',
              active: 'text-primary font-semibold bg-accented',
              inactive: 'text-default hover:bg-accented hover:text-highlighted',
            },
          }"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="currentPageTitle" />
      </template>

      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const auth = useAuthStore();

const currentPageTitle = computed(() => {
  if (route.path.includes("/usuarios")) return "Usuarios";
  if (route.path.includes("/ordenes-produccion"))
    return "Órdenes de Producción";
  if (route.path.includes("/productos")) return "Productos";
  return "Sistema de Producción";
});

const dropdownItems = [
  [
    {
      label: "Cerrar sesión",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: () => {
        auth.logout();
      },
    },
  ],
];

const navigationItems: NavigationMenuItem[][] = [
  [
    {
      label: "Inicio",
      icon: "i-heroicons-home",
      to: "/",
      exact: true,
    },
  ],

  [
    {
      label: "Producción",
      icon: "i-heroicons-cog-6-tooth",
      defaultOpen:
        route.path.startsWith("/ordenes-produccion") ||
        route.path.startsWith("/lineas-orden"),
      children: [
        {
          label: "Órdenes de Producción",
          icon: "i-heroicons-clipboard-document-list",
          to: "/ordenes-produccion",
        },
        {
          label: "Líneas de Orden",
          icon: "i-heroicons-bars-3",
          to: "/lineas-orden",
        },
        {
          label: "Estaciones",
          icon: "i-heroicons-building-office-2",
          to: "/estacion-produccion",
        },
        { label: "Máquinas", icon: "i-heroicons-cpu-chip", to: "/maquinas" },
        {
          label: "Eventos y Seguimiento",
          icon: "i-heroicons-calendar-days",
          to: "/orden-evento",
        },
        {
          label: "Costos de Orden",
          icon: "i-heroicons-banknotes",
          to: "/costos-orden",
        },
        {
          label: "Método de Valoración",
          icon: "i-heroicons-scale",
          to: "/metodo-valoracion",
        },
        {
          label: "Parámetros de Planificación",
          icon: "i-heroicons-adjustments-horizontal",
          to: "/parametro-planificacion",
        },
      ],
    },
  ],

  [
    {
      label: "Inventario",
      icon: "i-heroicons-archive-box",
      defaultOpen:
        route.path.startsWith("/bodegas") ||
        route.path.startsWith("/inventario-lote"),
      children: [
        {
          label: "Bodegas",
          icon: "i-heroicons-building-storefront",
          to: "/bodegas",
        },
        {
          label: "Inventario por Lote",
          icon: "i-heroicons-archive-box",
          to: "/inventario-lote",
        },
        {
          label: "Movimientos de Inventario",
          icon: "i-heroicons-arrow-path",
          to: "/movimientos-inventario",
        },
        {
          label: "Conteo Cíclico",
          icon: "i-heroicons-check-badge",
          to: "/conteo-ciclico",
        },
        {
          label: "Discrepancias",
          icon: "i-heroicons-exclamation-triangle",
          to: "/discrepancia-inventario",
        },
        {
          label: "Reserva de Material",
          icon: "i-heroicons-inbox-arrow-down",
          to: "/reserva-material-orden",
        },
        {
          label: "Punto de Reorden",
          icon: "i-heroicons-flag",
          to: "/punto-reorden",
        },
        {
          label: "Requerimiento de Material",
          icon: "i-heroicons-cube-transparent",
          to: "/requerimiento-material",
        },
      ],
    },
  ],

  [
    {
      label: "Incidencias",
      icon: "i-heroicons-bug-ant",
      defaultOpen: route.path.startsWith("/incidentes"),
      children: [
        {
          label: "Gestión de Incidentes",
          icon: "i-heroicons-bug-ant",
          to: "/incidentes",
        },
        {
          label: "Tipos de Incidencia",
          icon: "i-heroicons-rectangle-group",
          to: "/tipos-incidencia",
        },
        {
          label: "Estados de Incidencia",
          icon: "i-heroicons-adjustments-horizontal",
          to: "/estados-incidencia",
        },
      ],
    },
  ],

  [
    {
      label: "Catálogos",
      icon: "i-heroicons-rectangle-stack",
      defaultOpen: route.path.startsWith("/productos"),
      children: [
        { label: "Productos", icon: "i-heroicons-cube", to: "/productos" },
        {
          label: "Estructura del Producto (BOM)",
          icon: "i-heroicons-cube-transparent",
          to: "/estructura-producto",
        },
        {
          label: "Tipos de Producto",
          icon: "i-heroicons-squares-2x2",
          to: "/tipos-producto",
        },
        {
          label: "Estados de Orden",
          icon: "i-heroicons-tag",
          to: "/estados-orden",
        },
        {
          label: "Tipos de Costo",
          icon: "i-heroicons-banknotes",
          to: "/tipos-costo",
        },
        {
          label: "Tipos de Bodega",
          icon: "i-heroicons-building-library",
          to: "/tipos-bodega",
        },
        {
          label: "Tipos de Movimiento",
          icon: "i-heroicons-arrows-right-left",
          to: "/tipos-movimientos",
        },
      ],
    },
  ],

  [
    {
      label: "Usuarios y Seguridad",
      icon: "i-heroicons-user-group",
      defaultOpen: route.path.startsWith("/usuarios"),
      children: [
        { label: "Usuarios", icon: "i-heroicons-users", to: "/usuarios" },
        {
          label: "Roles",
          icon: "i-heroicons-identification",
          to: "/usuarios/roles",
        },
        {
          label: "Políticas",
          icon: "i-heroicons-shield-check",
          to: "/usuarios/politicas",
        },
      ],
    },
  ],
  [
    {
      label: "Configuración",
      icon: "i-heroicons-wrench-screwdriver",
      defaultOpen: route.path.startsWith("/unidades-medida"),
      children: [
        {
          label: "Unidades de Medida",
          icon: "i-heroicons-scale",
          to: "/unidades-medida",
        },
        {
          label: "Tipos de Unidad",
          icon: "i-heroicons-swatch",
          to: "/unidades-medida-tipo",
        },
        {
          label: "Conversiones",
          icon: "i-heroicons-arrows-right-left",
          to: "/unidades-conversion",
        },
      ],
    },
  ],
  [
    {
      label: "Dashboards y reportes",
      icon: "i-heroicons-chart-pie",
      defaultOpen: route.path.startsWith("/productividad"),
      children: [
        {
          label: "Índice de productividad",
          icon: "i-heroicons-presentation-chart-line",
          to: "/productividad",
        },
        {
          label: "Reporte de costos material",
          icon: "i-heroicons-cube-transparent",
          to: "/reporte/costos-material",
        },
        {
          label: "Reporte de costos por orden",
          icon: "i-heroicons-clipboard-document-check",
          to: "/reporte/costos-orden",
        },
        {
          label: "Gráfico de costos",
          icon: "i-heroicons-banknotes",
          to: "/reporte/temporal-costos",
        },
        {
          label: "Gráfico de producción",
          icon: "i-heroicons-cog-6-tooth",
          to: "/reporte/temporal-produccion",
        },
        {
          label: "Gráfico de tiempos",
          icon: "i-heroicons-clock",
          to: "/reporte/temporal-tiempos",
        },
      ],
    },
  ],
];
</script>
