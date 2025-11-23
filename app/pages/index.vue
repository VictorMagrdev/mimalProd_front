<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 pl-8 pt-4">
          Dashboard de Producción
        </h1>
        <p class="text-gray-600">Resumen general del rendimiento productivo</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Producción Hoy</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatNumber(produccionHoy) }}
              </p>
            </div>
            <UIcon name="i-heroicons-cube" class="w-8 h-8 text-blue-500" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Cumplimiento Hoy</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatPercentage(cumplimientoHoy) }}
              </p>
            </div>
            <UIcon
              name="i-heroicons-check-badge"
              class="w-8 h-8 text-green-500"
            />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Órdenes Atrasadas</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ ordenesAtrasadas }}
              </p>
            </div>
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-8 h-8 text-red-500"
            />
          </div>
        </UCard>
      </div>

      <!-- GRÁFICOS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- PRODUCCIÓN 7 DÍAS (LINE CHART) -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900">
              Producción Últimos 7 Días
            </h3>
          </template>

          <div class="h-64">
            <VisXYContainer v-if="produccion7Dias.length" :height="250">
              <VisLine
                :data="produccion7Dias"
                :x="(d: any) => formatDate(d.fecha)"
                :y="(d: any) => d.total"
              />
              <VisAxis type="x" />
              <VisAxis type="y" />
            </VisXYContainer>
          </div>
        </UCard>

        <!-- ÓRDENES POR ESTADO (DONUT) -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900">
              Órdenes por Estado
            </h3>
          </template>

          <div class="h-64">
            <VisBulletLegend
              v-if="ordenesPorEstado.length"
              :items="ordenesPorEstado.map((o) => ({ name: o.estado }))"
            />

            <VisSingleContainer v-if="ordenesPorEstado.length" :height="250">
              <VisDonut
                :data="ordenesPorEstado"
                :value="(d: any) => d.cantidad"
                :label="(d: any) => d.estado"
                :pad-angle="0.01"
                :arc-width="80"
              />
            </VisSingleContainer>
          </div>
        </UCard>

        <!-- TOP PRODUCTOS (BAR CHART) -->
        <UCard class="lg:col-span-2">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900">
              Top Productos (30 Días)
            </h3>
          </template>

          <div class="h-64">
            <VisXYContainer v-if="topProductos.length" :height="260">
              <VisGroupedBar
                :data="topProductos"
                :x="(d: any) => d.nombre"
                :y="[(d: any) => d.totalProducido]"
              />
              <VisAxis type="x" />
              <VisAxis type="y" />
            </VisXYContainer>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import {
  VisXYContainer,
  VisAxis,
  VisLine,
  VisGroupedBar,
  VisSingleContainer,
  VisDonut,
  VisBulletLegend,
} from "@unovis/vue";

// Reactive Data
const produccion7Dias = ref<{ fecha: string; total: number }[]>([]);
const topProductos = ref<{ nombre: string; totalProducido: number }[]>([]);
const ordenesPorEstado = ref<{ estado: string; cantidad: number }[]>([]);
const ordenesAtrasadas = ref(0);
const produccionHoy = ref(0);
const cumplimientoHoy = ref(0);

const backend: string = "http://localhost:8080/api/dashboard";
const auth = useAuthStore();
onMounted(async () => {
  produccion7Dias.value = await $fetch(`${backend}/produccion/7-dias`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
  topProductos.value = await $fetch(`${backend}/productos/top-30-dias`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
  ordenesPorEstado.value = await $fetch(`${backend}/ordenes/por-estado`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
  ordenesAtrasadas.value = await $fetch(`${backend}/ordenes/atrasadas-hoy`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
  produccionHoy.value = await $fetch(`${backend}/produccion/hoy`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
  cumplimientoHoy.value = await $fetch(`${backend}/cumplimiento/hoy`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
});

// Utils
const formatNumber = (n: number) =>
  new Intl.NumberFormat("es-ES").format(n || 0);

const formatPercentage = (v: number) =>
  v != null ? `${(v * 100).toFixed(1)}%` : "0%";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });
</script>

<style scoped>
.h-64 {
  height: 16rem;
}
</style>
