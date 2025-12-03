<template>
  <div class="space-y-6">
    <ChartControls
      title="Serie temporal — Producción"
      :fallbacks="fallbacks"
      :fallback-value="fallbackValue"
      :interpolation="interpolation"
      :show-scatter="showScatter"
      @update:fallback-value="fallbackValue = $event"
      @update:interpolation="interpolation = $event"
      @update:show-scatter="showScatter = $event"
    />

    <UCard>
      <VisXYContainer
        :data="chartData"
        :margin="{ top: 20, right: 20, bottom: 60, left: 60 }"
        height="420px"
      >
        <VisLine
          :curve-type="CurveType.Linear"
          :fallback-value="fallbackValue"
          :interpolate-missing-data="interpolation"
          :x="xCallback"
          :y="seriesYMemo[0]"
          :color="seriesColor[0]"
        />

        <template v-if="showScatter">
          <VisScatter :size="6" :x="xCallback" :y="seriesYMemo[0]" />
        </template>

        <VisCrosshair :color="crosshairColors" :template="crosshairTemplate" />
        <VisTooltip />
        <VisAxis type="x" :label="'Fecha'" />
        <VisAxis type="y" :label="'Valor (producción)'" />
      </VisXYContainer>
    </UCard>

    <UAlert
      v-if="pending"
      icon="i-heroicons-clock"
      title="Cargando datos..."
      description="Por favor espere mientras se cargan la serie de producción."
      color="success"
    />
  </div>
</template>

<script setup lang="ts">
import { CurveType } from "@unovis/ts";
import {
  VisAxis,
  VisCrosshair,
  VisLine,
  VisScatter,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";

import { isFiniteNumber } from "~/utils/function";
import type { ChartDataPoint, SerieTemporalDTO } from "~/utils/types";

const chart = useChart();
const auth = useAuthStore();

const {
  fallbacks,
  fallbackValue,
  interpolation,
  showScatter,
  chartData,
  xCallback,
  seriesYMemo,
  seriesColor,
  crosshairColors,
  setSeries,
  setChartData,
} = chart;

const { data: raw, pending } = useAsyncData<SerieTemporalDTO[]>(
  "serie-produccion",
  async () => {
    const { data } = await useFetch<SerieTemporalDTO[]>(
      "https://three-assured-ian-impressive.trycloudflare.com/api/dashboard/produccion/serie",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${auth.token}` },
        default: () => [],
      },
    );
    return data.value || [];
  },
);

watch(
  raw,
  (list) => {
    if (!list || !list.length) {
      setSeries([
        { id: "v", nombre: "Producción", color: "var(--vis-color0)" },
      ]);
      setChartData([]);
      return;
    }

    setSeries([{ id: "v", nombre: "Producción", color: "var(--vis-color0)" }]);

    const newChartData: ChartDataPoint[] = list.map((it) => {
      const date = new Date(it.fecha + "T00:00:00Z");
      const iso = date.toISOString();

      return {
        xValue: iso,
        fecha: iso,
        v: Number(it.valor),
      };
    });

    setChartData(newChartData);
  },
  { immediate: true },
);

const crosshairTemplate = (d: ChartDataPoint) => {
  const fecha = d.fecha ?? d.xValue;
  const val = d.v ?? "Sin dato";
  return `<div class="text-sm"><strong>${fecha}</strong><br/>Producción: ${isFiniteNumber(val) ? Number(val).toLocaleString() : "Sin dato"}</div>`;
};
</script>
