<script setup lang="ts">
import { gql } from "graphql-tag";
import { VisXYContainer, VisLine } from "@unovis/vue";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const maquinaId = route.params.id as string;

const GetMaquina = gql`
  query GetMaquina($id: ID!) {
    maquina(id: $id) {
      id
      codigo
      nombre
      descripcion
      numeroSerie
      fechaCompra
      costoCompra
      valorRescate
      vidaUtilAnios
      creadoEn
      depreciaciones {
        id
        periodo
        depreciacionPeriodo
        depreciacionAcumulada
        valorNeto
      }
    }
  }
`;

const maquina = ref<Maquina | null>(null);
const depreciaciones = ref<Depreciacion[]>([]);

const { data: dataMaquina } = await useAsyncQuery<{ maquina: Maquina }>(
  GetMaquina,
  { id: maquinaId },
);
maquina.value = dataMaquina.value?.maquina || null;

const depreciacionProyectada = computed<PuntoGrafico[]>(() => {
  const maquinaActual = maquina.value;
  if (!maquinaActual) return [];

  const {
    costoCompra,
    valorRescate = 0,
    vidaUtilAnios,
    fechaCompra,
  } = maquinaActual;
  const depreciacionAnual = (costoCompra - valorRescate) / vidaUtilAnios;

  const años = Array.from({ length: vidaUtilAnios + 1 }, (_, i) => i);

  return años.map((año) => {
    const fecha = new Date(fechaCompra);
    fecha.setFullYear(fecha.getFullYear() + año);

    const fechaISO: string = fecha.toISOString().split("T")[0] || "";
    const acumulado = depreciacionAnual * año;
    const valorEnLibros = Math.max(costoCompra - acumulado, valorRescate);

    const punto: PuntoGrafico = {
      año,
      fecha: fechaISO,
      valorEnLibros,
      valorDepreciacion: año === 0 ? 0 : depreciacionAnual,
      valorAcumulado: acumulado,
      tipo: "Proyectado",
    };

    return punto;
  });
});

const graphData = computed<PuntoGrafico[]>(() => {
  const maquinaActual = maquina.value;
  if (!maquinaActual) return [];

  const añoBase = new Date(maquinaActual.fechaCompra).getFullYear();

  const datosReales = depreciaciones.value.map((dep) => {
    const año = new Date(dep.periodo).getFullYear() - añoBase;

    return {
      año,
      fecha: dep.periodo,
      valorEnLibros: Number(dep.valorNeto),
      valorDepreciacion: Number(dep.depreciacionPeriodo),
      valorAcumulado: Number(dep.depreciacionAcumulada),
      tipo: "Real",
      color: "#3b82f6",
    } satisfies PuntoGrafico & { color: string };
  });

  const datosProyectados = depreciacionProyectada.value.map((punto) => ({
    ...punto,
    color: "#6b7280",
  }));

  const grafico = [...datosProyectados, ...datosReales];

  return grafico;
});

const x = (d: PuntoGrafico) => d.año;
const y = (d: PuntoGrafico) => d.valorEnLibros;
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Depreciación de la Máquina</h2>
      </template>

      <div class="h-96">
        <VisXYContainer :data="graphData">
          <VisLine :x="x" :y="y" :color="(d: any) => d.color" />
        </VisXYContainer>
      </div>

      <template #footer>
        <div class="flex items-center space-x-4 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-blue-500 rounded" />
            <span>Real</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-gray-500 rounded" />
            <span>Proyectado</span>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
