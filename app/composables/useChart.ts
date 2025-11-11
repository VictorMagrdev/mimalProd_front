import type { ChartDataPoint, ChartSeries } from "~/utils/types";

interface UseChartReturn {
  fallbacks: (number | null | undefined)[];
  fallbackValue: Ref<number | null | undefined>;
  interpolation: Ref<boolean>;
  showScatter: Ref<boolean>;
  chartData: Ref<ChartDataPoint[]>;
  xCallback: (d: ChartDataPoint) => number | string;
  series: Ref<ChartSeries[]>;
  seriesColor: Ref<string[]>;
  seriesYMemo: Ref<((d: ChartDataPoint) => number | string | undefined)[]>;
  crosshairColors: Ref<string[]>;
  setSeries: (newSeries: ChartSeries[]) => void;
  setChartData: (newData: ChartDataPoint[]) => void;
}

export function useChart(initialData: ChartDataPoint[] = []): UseChartReturn {
  const fallbacks: (number | null | undefined)[] = [null, undefined, 0];
  const fallbackValue = ref<number | null | undefined>(fallbacks[0]);
  const interpolation = ref<boolean>(true);
  const showScatter = ref<boolean>(true);
  const chartData = ref<ChartDataPoint[]>(initialData);

  const xCallback = (d: ChartDataPoint): number | string => d.xValue;

  const series = ref<ChartSeries[]>([]);
  const seriesColor = computed(() => series.value.map((s) => s.color));

  const getY = (s: ChartSeries) => (d: ChartDataPoint) => d[s.id];
  const seriesYMemo = computed(() => series.value.map(getY));

  const crosshairColors = computed(() => series.value.map((s) => s.color));

  const setSeries = (newSeries: ChartSeries[]): void => {
    series.value = newSeries;
  };

  const setChartData = (newData: ChartDataPoint[]): void => {
    chartData.value = newData;
  };

  return {
    fallbacks,
    fallbackValue,
    interpolation,
    showScatter,
    chartData,
    xCallback,
    series,
    seriesColor,
    seriesYMemo,
    crosshairColors,
    setSeries,
    setChartData,
  };
}
