<template>
  <div class="space-y-6">
    <!-- Controles -->
    <ChartControls
      title="Costos por Material"
      :fallbacks="fallbacks"
      :fallback-value="fallbackValue"
      :interpolation="interpolation"
      :show-scatter="showScatter"
      @update:fallback-value="fallbackValue = $event"
      @update:interpolation="interpolation = $event"
      @update:show-scatter="showScatter = $event"
      @export-pdf="handleExportPDF"
      @export-csv="handleExportCSV"
    >
      <template #additional-controls>
        <UFormField label="Tipo de gráfico:" class="w-48">
          <USelect v-model="chartType" :options="chartTypeOptions" />
        </UFormField>
      </template>
    </ChartControls>

    <!-- Gráfico -->
    <UCard>
      <VisXYContainer
        :data="chartData"
        :margin="{ top: 20, right: 20, bottom: 80, left: 80 }"
        height="400px"
      >
        <VisLine
          v-if="chartType === 'line'"
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

        <VisCrosshair :template="crosshairTemplate" />
        <VisTooltip />
        <VisAxis
          type="x"
          :label="'Materiales'"
          :tick-format="xAxisTickFormat"
        />
        <VisAxis
          type="y"
          :label="'Costos ($)'"
          :tick-format="yAxisTickFormat"
        />
      </VisXYContainer>
    </UCard>

    <!-- Loading State -->
    <UAlert
      v-if="pending"
      icon="i-heroicons-clock"
      title="Cargando datos..."
      description="Por favor espere mientras se cargan los costos por material."
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
import { computed, ref } from "vue";

import type { ChartDataPoint, ReporteCostoMaterialDTO } from "~/utils/types";

const chart = useChart();
const exportState = useExport();

// Destructurar del composable chart
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
  setSeries,
  setChartData,
} = chart;

const chartType = ref<"line" | "bar">("line");

const auth = useAuthStore();

const { data: costosMaterialData, pending } = useAsyncData<
  ReporteCostoMaterialDTO[]
>("costos-material", async () => {
  const { data } = await useFetch<ReporteCostoMaterialDTO[]>(
    "https://obvolutive-angelica-nonnotably.ngrok-free.dev/api/reportes/costos/material",
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

const chartTypeOptions = [
  { label: "Líneas", value: "line" },
  { label: "Barras", value: "bar" },
];

const crosshairTemplate = computed(() => (d: ChartDataPoint) => {
  return `
    <div class="text-sm">
      <strong>Material: ${d.materialNombre}</strong><br/>
      Cantidad: ${d.cantidad || 0}<br/>
      Costo Unitario: $${d.unitario || 0}<br/>
      <strong>Costo Total: $${d.total || 0}</strong>
    </div>
  `;
});

const xAxisTickFormat = (d: number, i: number) => {
  const material = series.value[i];
  return material ? material.nombre.substring(0, 10) + "..." : "";
};

const yAxisTickFormat = (d: number) => `$${d}`;

watchEffect(() => {
  if (costosMaterialData.value && costosMaterialData.value.length > 0) {
    const newSeries = costosMaterialData.value.map((item, index) => ({
      id: `mat_${index}`,
      nombre: item.material,
      color: `var(--vis-color${index % 5})`,
    }));

    setSeries(newSeries);

    const newChartData: ChartDataPoint[] = costosMaterialData.value.map(
      (item, index) => {
        const dataPoint: ChartDataPoint = {
          xValue: index,
          materialNombre: item.material,
          cantidad: item.cantidad,
          unitario: item.costoUnitario,
          total: item.costoTotal,
        };

        newSeries.forEach((serie) => {
          if (serie.id === `mat_${index}`) {
            dataPoint[serie.id] = item.costoTotal;
          }
        });

        return dataPoint;
      },
    );

    setChartData(newChartData);
  }
});

const handleExportPDF = async (): Promise<void> => {
  try {
    await exportState.descargarArchivo(
      "https://obvolutive-angelica-nonnotably.ngrok-free.dev/api/reportes/costos/material/pdf",
      "reporte_costos_material.pdf",
    );
  } catch (error) {
    useToast().add({
      title: "Error",
      description: String(error) || "Error al descargar PDF",
      color: "error",
    });
  }
};

const handleExportCSV = async (): Promise<void> => {
  try {
    await exportState.descargarArchivo(
      "https://obvolutive-angelica-nonnotably.ngrok-free.dev/api/reportes/costos/material/csv",
      "reporte_costos_material.csv",
      "CSV",
    );
  } catch (error) {
    useToast().add({
      title: "Error",
      description: String(error) || "Error al descargar CSV",
      color: "error",
    });
  }
};
</script>
