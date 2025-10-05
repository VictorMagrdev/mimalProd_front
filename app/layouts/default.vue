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
        body: 'space-y-4'
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-3 w-full">
          <UDropdownMenu :items="dropdownItems" :popper="{ placement: 'bottom-start' }">
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
                  alt: 'Usuario'
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
              inactive: 'text-default hover:bg-accented hover:text-highlighted'
            }
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
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { NavigationMenuItem } from "@nuxt/ui";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const currentPageTitle = computed(() => {
  const routeName = route.name?.toString() || '';
  const titleMap: Record<string, string> = {
    'index': 'Inicio',
    'usuarios': 'Usuarios',
    'ordenes-produccion': 'Órdenes de Producción',
    'productos': 'Productos',
  };
  return titleMap[routeName] || 'Sistema de Producción';
});

const dropdownItems = [
  [
    {
      label: 'Cerrar sesión',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: () => {
        auth.logout();
        router.push('/');
      }
    }
  ]
];

const navigationItems: NavigationMenuItem[][] = [
  [
    {
      label: 'Inicio',
      icon: 'i-heroicons-home',
      to: '/',
      exact: true
    }
  ],
  [
    {
      label: 'Usuarios',
      icon: 'i-heroicons-users',
      defaultOpen: route.path.startsWith('/usuarios'),
      children: [
        {
          label: 'Listado',
          icon: 'i-heroicons-list-bullet',
          to: '/usuarios',
          exact: true
        },
        {
          label: 'Roles',
          icon: 'i-heroicons-user-group',
          to: '/usuarios/roles'
        },
        {
          label: 'Políticas',
          icon: 'i-heroicons-shield-check',
          to: '/usuarios/politicas'
        }
      ]
    }
  ],
  [
    {
      label: 'Producción',
      icon: 'i-heroicons-cog',
      defaultOpen: route.path.startsWith('/ordenes-produccion') || 
                  route.path.startsWith('/lineas-orden') ||
                  route.path.startsWith('/lotes-produccion') ||
                  route.path.startsWith('/costos-orden'),
      children: [
        {
          label: 'Órdenes',
          icon: 'i-heroicons-clipboard-document-list',
          to: '/ordenes-produccion'
        },
        {
          label: 'Líneas de Orden',
          icon: 'i-heroicons-bars-3',
          to: '/lineas-orden'
        },
        {
          label: 'Lotes',
          icon: 'i-heroicons-archive-box',
          to: '/lotes-produccion'
        },
        {
          label: 'Costos',
          icon: 'i-heroicons-currency-dollar',
          to: '/costos-orden'
        },
        {
          label: 'Bodegas',
          icon: 'i-heroicons-building-storefront',
          to: '/bodegas'
        },
        {
          label: 'Conteo Cíclico',
          icon: 'i-heroicons-check-circle',
          to: '/conteo-ciclico'
        },
        {
          label: 'Discrepancia Inventario',
          icon: 'i-heroicons-exclamation-triangle',
          to: '/discrepancia-inventario'
        },
        {
          label: 'Inventario Lote',
          icon: 'i-heroicons-archive-box',
          to: '/inventario-lote'
        },
        {
          label: 'Movimientos Inventario',
          icon: 'i-heroicons-arrow-path',
          to: '/movimientos-inventario'
        },
        {
          label: 'Orden Estación',
          icon: 'i-heroicons-rectangle-stack',
          to: '/orden-estacion'
        },
        {
          label: 'Orden Evento',
          icon: 'i-heroicons-calendar',
          to: '/orden-evento'
        },
        {
          label: 'Método de Valoración',
          icon: 'i-heroicons-scale',
          to: '/metodo-valoracion'
        },
        {
          label: 'Reserva Material Orden',
          icon: 'i-heroicons-inbox',
          to: '/reserva-material-orden'
        },
        {
          label: 'Punto Reorden',
          icon: 'i-heroicons-flag',
          to: '/punto-reorden'
        },
        {
          label: 'Estación Producción',
          icon: 'i-heroicons-cog-6-tooth',
          to: '/estacion-produccion'
        }
      ]
    }
  ],
  [
    {
      label: 'Catálogos',
      icon: 'i-heroicons-rectangle-stack',
      defaultOpen: route.path.startsWith('/productos') ||
                  route.path.startsWith('/estados-orden') ||
                  route.path.startsWith('/tipos-costo'),
      children: [
        {
          label: 'Productos',
          icon: 'i-heroicons-cube',
          to: '/productos'
        },
        {
          label: 'Estados de Orden',
          icon: 'i-heroicons-tag',
          to: '/estados-orden'
        },
        {
          label: 'Tipos de Costo',
          icon: 'i-heroicons-tag',
          to: '/tipos-costo'
        },
        {
          label: 'Tipos de Bodega',
          icon: 'i-heroicons-building-library',
          to: '/tipos-bodega'
        },
        {
          label: 'Tipos de Movimientos',
          icon: 'i-heroicons-arrows-right-left',
          to: '/tipos-movimientos'
        },
        {
          label: 'Tipos de Producto',
          icon: 'i-heroicons-cube',
          to: '/tipos-producto'
        }
      ]
    }
  ],
  [
    {
      label: 'Configuración',
      icon: 'i-heroicons-wrench-screwdriver',
      defaultOpen: route.path.startsWith('/unidades-medida') ||
                  route.path.startsWith('/unidades-medida-tipo') ||
                  route.path.startsWith('/unidades-conversion'),
      children: [
        {
          label: 'Unidades de Medida',
          icon: 'i-heroicons-scale',
          to: '/unidades-medida'
        },
        {
          label: 'Tipos de Unidad',
          icon: 'i-heroicons-swatch',
          to: '/unidades-medida-tipo'
        },
        {
          label: 'Conversiones',
          icon: 'i-heroicons-arrows-right-left',
          to: '/unidades-conversion'
        }
      ]
    }
  ]
];
</script>