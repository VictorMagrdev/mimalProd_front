<template>
  <div class="space-y-6">
    <ChartControls
      title="Serie temporal — Costos"
      :fallbacks="fallbacks"
      :fallback-value="fallbackValue"
      :interpolation="interpolation"
      :show-scatter="showScatter"
      @update:fallback-value="fallbackValue = $event"
      @update:interpolation="interpolation = $event"
      @update:show-scatter="showScatter = $event"
    >
      <template #additional-controls>
        <UFormField label="Agrupar por:">
          <URadioGroup
            v-model="groupBy"
            :options="[
              { label: 'Diario', value: 'diario' },
              { label: 'Mensual', value: 'mensual' },
            ]"
            variant="list"
          />
        </UFormField>
      </template>
    </ChartControls>

    <UCard>
      <VisXYContainer
        :data="chartData"
        :margin="{ top: 20, right: 20, bottom: 60, left: 70 }"
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
        <VisAxis type="y" :label="'Costo (moneda)'" />
      </VisXYContainer>
    </UCard>

    <UAlert
      v-if="pending"
      icon="i-heroicons-clock"
      title="Cargando datos..."
      description="Cargando serie de costos."
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

const groupBy = ref<"diario" | "mensual">("diario");

const { data: raw, pending } = useAsyncData<SerieTemporalDTO[]>(
  () => `serie-costos-${groupBy.value}`,
  async () => {
    const path =
      groupBy.value === "mensual"
        ? "https://engagement-roommate-martha-brunette.trycloudflare.com/api/dashboard/costos/serie-mensual"
        : "https://engagement-roommate-martha-brunette.trycloudflare.com/api/dashboard/costos/serie";
    const { data } = await useFetch<SerieTemporalDTO[]>(path, {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
      default: () => [],
    });
    return data.value || [];
  },
  { watch: [groupBy] },
);

watch(
  raw,
  (list) => {
    setSeries([{ id: "v", nombre: "Costos", color: "var(--vis-color1)" }]);
    if (!list || !list.length) {
      setChartData([]);
      return;
    }
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
  const val = d.v;
  return `<div class="text-sm"><strong>${fecha}</strong><br/>Costo: ${isFiniteNumber(val) ? Number(val).toLocaleString() : "Sin dato"}</div>`;
};
</script>
