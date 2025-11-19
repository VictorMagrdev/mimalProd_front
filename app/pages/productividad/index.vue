<template>
  <div class="space-y-6">
    <!-- Controles -->
    <ChartControls
      title="Indicadores de Productividad"
      :fallbacks="fallbacks"
      :fallback-value="fallbackValue"
      :interpolation="interpolation"
      :show-scatter="showScatter"
      @update:fallback-value="fallbackValue = $event"
      @update:interpolation="interpolation = $event"
      @update:show-scatter="showScatter = $event"
      @export-pdf="handleExportPDF"
      @export-csv="handleExportCSV"
    />

    <!-- Gráfico -->
    <UCard>
      <VisXYContainer
        :data="chartData"
        :margin="{ top: 20, right: 20, bottom: 50, left: 60 }"
        height="400px"
      >
        <VisLine
          :curve-type="CurveType.Linear"
          :fallback-value="fallbackValue"
          :interpolate-missing-data="interpolation"
          :x="xCallback"
          :y="seriesYMemo"
          :color="seriesColor"
        />

        <template v-if="showScatter">
          <VisScatter
            v-for="serie in series"
            :key="serie.id"
            :size="6"
            :x="xCallback"
            :color="serie.color"
            :y="(d: any) => d[serie.id]"
          />
        </template>

        <VisCrosshair :color="crosshairColors" :template="crosshairTemplate" />
        <VisTooltip />
        <VisAxis type="x" :label="'Órdenes de Producción'" />
        <VisAxis
          type="y"
          :label="'Eficiencia (%)'"
          :tick-format="yAxisTickFormat"
        />
      </VisXYContainer>
    </UCard>

    <!-- Loading State -->
    <UAlert
      v-if="pending"
      icon="i-heroicons-clock"
      title="Cargando datos..."
      description="Por favor espere mientras se cargan los indicadores de productividad."
      color="blue"
    />
  </div>
</template>

<script setup lang="ts">
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisCrosshair,
  VisScatter,
  VisTooltip,
} from "@unovis/vue";
import { CurveType } from "@unovis/ts";

import type { IndicadorProductividadDTO, ChartDataPoint } from "~/utils/types";

// Composables
const chart = useChart();
const exportState = useExport();

const {
  fallbacks,
  fallbackValue,
  interpolation,
  showScatter,
  chartData,
  xCallback,
  series,
  seriesYMemo,
  seriesColor,
  crosshairColors,
  setSeries,
  setChartData,
} = chart;

const auth = useAuthStore();
// Fetch data con useAsyncData de Nuxt
const { data: productividadData, pending } = useAsyncData<
  IndicadorProductividadDTO[]
>("productividad", async () => {
  const { data } = await useFetch<IndicadorProductividadDTO[]>(
    "http://localhost:8080/api/reportes/productividad",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      default: () => [],
    },
  );
  return data.value || [];
});

// Computed
const crosshairTemplate = (d: ChartDataPoint) => {
  if (!d) return "";

  const rowsHtml = series.value
    .map(({ id, nombre }) => {
      const value = d[id];
      const num = typeof value === "number" ? value : Number(value);
      const formatted = Number.isFinite(num)
        ? `${Math.round(num)}%`
        : "Sin dato";
      return `<div>${nombre}: ${formatted}</div>`;
    })
    .join("");

  return `
    <div class="text-sm leading-tight">
      <strong>Orden: ${d.ordenId ?? "—"}</strong>
      ${rowsHtml}
    </div>
  `;
};

const yAxisTickFormat = (d: number) => `${d}%`;

watch(
  productividadData,
  (data) => {
    if (!data?.length) return;

    const productosUnicos = Array.from(new Set(data.map((i) => i.producto)));
    const newSeries = productosUnicos.map((nombre, index) => ({
      id: `prod_${index}`,
      nombre,
      color: `var(--vis-color${index % 5})`,
    }));

    setSeries(newSeries);

    const productoToSerie = Object.fromEntries(
      newSeries.map((s) => [s.nombre, s.id]),
    );

    const newChartData = data.map((item) => ({
      xValue: item.ordenId,
      ordenId: item.ordenId,
      [String(productoToSerie[item.producto])]: item.eficiencia,
    }));

    setChartData(newChartData);
  },
  { immediate: true },
);

// Métodos
const handleExportPDF = async (): Promise<void> => {
  try {
    await exportState.descargarArchivo(
      "http://localhost:8080/api/reportes/productividad/pdf",
      "indicadores_productividad.pdf",
    );
  } catch (error) {
    useToast().add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Error al descargar PDF",
      color: "error",
    });
  }
};

const handleExportCSV = async (): Promise<void> => {
  try {
    await exportState.descargarArchivo(
      "http://localhost:8080/api/reportes/productividad/csv",
      "indicadores_productividad.csv",
      "CSV",
    );
  } catch (error) {
    useToast().add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Error al descargar CSV",
      color: "error",
    });
  }
};
</script>
