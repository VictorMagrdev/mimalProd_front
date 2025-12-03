<template>
  <div class="space-y-6">
    <!-- Controles -->
    <ChartControls
      title="Costos por Orden de Producción"
      :fallbacks="fallbacks"
      :fallback-value="fallbackValue"
      :interpolation="false"
      :show-scatter="showScatter"
      @update:fallback-value="fallbackValue = $event"
      @update:show-scatter="showScatter = $event"
      @export-pdf="handleExportPDF"
      @export-csv="handleExportCSV"
    >
      <template #additional-controls>
        <UFormField label="Tipo de costo:" class="w-48">
          <USelect
            v-model="tipoCostoSeleccionado"
            :options="tiposCostoOptions"
          />
        </UFormField>
      </template>
    </ChartControls>

    <!-- Gráfico -->
    <UCard>
      <VisXYContainer
        :data="chartDataFiltrado"
        :margin="{ top: 20, right: 20, bottom: 50, left: 80 }"
        height="400px"
      >
        <VisLine
          :curve-type="CurveType.Linear"
          :fallback-value="fallbackValue"
          :x="xCallback"
          :y="seriesYMemoFiltrado"
          :color="seriesColorFiltrado"
        />

        <template v-if="showScatter">
          <VisScatter
            v-for="serie in seriesFiltradas"
            :key="serie.id"
            :size="6"
            :x="xCallback"
            :color="serie.color"
            :y="(d: any) => d[serie.id]"
          />
        </template>

        <VisCrosshair :template="crosshairTemplate" />
        <VisTooltip />
        <VisAxis type="x" :label="'Órdenes de Producción'" />
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
      description="Por favor espere mientras se cargan los costos por orden."
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

import type { ChartDataPoint, ReporteCostoOrdenDTO } from "~/utils/types";

// Composables
const chart = useChart();
const exportState = useExport();

// Destructurar del composable chart
const {
  fallbacks,
  fallbackValue,
  showScatter,
  chartData,
  xCallback,
  series,
  setSeries,
  setChartData,
} = chart;

// Estado local
const tipoCostoSeleccionado = ref<
  "todos" | "material" | "manoObra" | "indirecto" | "total"
>("todos");

const auth = useAuthStore();
// Fetch data
const { data: costosData, pending } = useAsyncData<ReporteCostoOrdenDTO[]>(
  "costos-orden",
  async () => {
    const { data } = await useFetch<ReporteCostoOrdenDTO[]>(
      "https://three-assured-ian-impressive.trycloudflare.com/api/reportes/costos/orden",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        default: () => [],
      },
    );
    return data.value || [];
  },
);

// Computed
const tiposCostoOptions = [
  { label: "Todos los costos", value: "todos" },
  { label: "Material", value: "material" },
  { label: "Mano de Obra", value: "manoObra" },
  { label: "Costos Indirectos", value: "indirecto" },
  { label: "Total", value: "total" },
];

const seriesFiltradas = computed(() => {
  if (tipoCostoSeleccionado.value === "todos") {
    return series.value;
  }
  return series.value.filter((s) => s.id === tipoCostoSeleccionado.value);
});

const seriesYMemoFiltrado = computed(() =>
  seriesFiltradas.value.map((s) => (d: ChartDataPoint) => d[s.id]),
);
const seriesColorFiltrado = computed(() =>
  seriesFiltradas.value.map((s) => s.color),
);

const chartDataFiltrado = computed(() => {
  if (tipoCostoSeleccionado.value === "todos") {
    return chartData.value;
  }
  return chartData.value.map((item) => ({
    ...item,
    [tipoCostoSeleccionado.value]: item[tipoCostoSeleccionado.value],
  }));
});

const crosshairTemplate = computed(() => (d: ChartDataPoint) => {
  return `
    <div class="text-sm">
      <strong>Orden: ${d.ordenId}</strong><br/>
      Material: $${d.material || 0}<br/>
      Mano Obra: $${d.manoObra || 0}<br/>
      Indirecto: $${d.indirecto || 0}<br/>
      <strong>Total: $${d.total || 0}</strong>
    </div>
  `;
});

const yAxisTickFormat = (d: number) => `$${d}`;

// Watch para actualizar gráfico
watchEffect(() => {
  if (costosData.value && costosData.value.length > 0) {
    const tiposCosto = [
      { id: "material", nombre: "Material", color: "var(--vis-color0)" },
      { id: "manoObra", nombre: "Mano de Obra", color: "var(--vis-color1)" },
      {
        id: "indirecto",
        nombre: "Costos Indirectos",
        color: "var(--vis-color2)",
      },
      { id: "total", nombre: "Total", color: "var(--vis-color3)" },
    ];

    setSeries(tiposCosto);

    const newChartData: ChartDataPoint[] = costosData.value.map((item) => ({
      xValue: item.ordenId,
      ordenId: item.ordenId,
      material: item.costoMaterial,
      manoObra: item.costoManoObra,
      indirecto: item.costoIndirecto,
      total: item.total,
    }));

    setChartData(newChartData);
  }
});

// Métodos
const handleExportPDF = async (): Promise<void> => {
  try {
    await exportState.descargarArchivo(
      "/api/reportes/costos/orden/pdf",
      "reporte_costos_orden.pdf",
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
      "/api/reportes/costos/orden/csv",
      "reporte_costos_orden.csv",
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
