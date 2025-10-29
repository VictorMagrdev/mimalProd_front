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
    }
  }
`;

const GetDepreciaciones = gql`
  query GetDepreciaciones {
    depreciaciones {
      id
      maquinaId
      periodo
      depreciacionPeriodo
      depreciacionAcumulada
      valorNeto
    }
  }
`;

interface Depreciacion {
  id: string;
  maquinaId: string;
  periodo: string;
  depreciacionPeriodo: string;
  depreciacionAcumulada: string;
  valorNeto: string;
}

interface Maquina {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  numeroSerie?: string;
  fechaCompra: string;
  costoCompra: number;
  valorRescate?: number;
  vidaUtilAnios: number;
  creadoEn: string;
}

interface PuntoGrafico {
  año: number;
  fecha: string;
  valorEnLibros: number;
  valorDepreciacion: number;
  valorAcumulado: number;
  tipo: "Real" | "Proyectado";
}

const maquina = ref<Maquina | null>(null);
const depreciaciones = ref<Depreciacion[]>([]);

const { data: dataMaquina } = await useAsyncQuery<{ maquina: Maquina }>(
  GetMaquina,
  { id: maquinaId },
);
maquina.value = dataMaquina.value?.maquina || null;

const { data: dataDep } = await useAsyncQuery<{
  depreciaciones: Depreciacion[];
}>(GetDepreciaciones);
depreciaciones.value =
  dataDep.value?.depreciaciones.filter((d) => d.maquinaId === maquinaId) || [];

const depreciacionProyectada = computed<PuntoGrafico[]>(() => {
  if (!maquina.value) return [];
  const { costoCompra, valorRescate, vidaUtilAnios, fechaCompra } =
    maquina.value;
  const depAnual = (costoCompra - (valorRescate || 0)) / vidaUtilAnios;
  const datos: PuntoGrafico[] = [];
  for (let i = 0; i <= vidaUtilAnios; i++) {
    const fecha = new Date(fechaCompra);
    fecha.setFullYear(fecha.getFullYear() + i);
    const acumulado = depAnual * i;
    const valorEnLibros = Math.max(costoCompra - acumulado, valorRescate || 0);
    datos.push({
      año: i,
      fecha: fecha.toISOString().split("T")[0] ?? "",
      valorEnLibros,
      valorDepreciacion: i === 0 ? 0 : depAnual,
      valorAcumulado: acumulado,
      tipo: "Proyectado",
    });
  }
  return datos;
});

const graphData = computed<PuntoGrafico[]>(() => {
  const reales: PuntoGrafico[] = depreciaciones.value.map((d) => {
    const año =
      new Date(d.periodo).getFullYear() -
      new Date(maquina.value!.fechaCompra).getFullYear();
    return {
      año,
      fecha: d.periodo,
      valorEnLibros: Number(d.valorNeto),
      valorDepreciacion: Number(d.depreciacionPeriodo),
      valorAcumulado: Number(d.depreciacionAcumulada),
      tipo: "Real",
      color: "#3b82f6",
    } as PuntoGrafico & { color: string };
  });

  const proyectadas: PuntoGrafico[] = depreciacionProyectada.value.map((d) => ({
    ...d,
    color: "#6b7280",
  }));

  return [...proyectadas, ...reales];
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
