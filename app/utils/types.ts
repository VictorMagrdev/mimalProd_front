export interface IndicadorProductividadDTO {
  ordenId: number;
  producto: string;
  unidadesProducidas: number;
  horasTrabajadas: number;
  eficiencia: number;
}

export interface ReporteCostoOrdenDTO {
  ordenId: number;
  producto: string;
  costoMaterial: number;
  costoManoObra: number;
  costoIndirecto: number;
  total: number;
}

export interface ReporteCostoMaterialDTO {
  material: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
}

export interface ChartSeries {
  id: string;
  nombre: string;
  color: string;
}

export interface ChartDataPoint {
  xValue: number | string;
  [key: string]: number | string | undefined;
}

export interface CostosKPIDTO {
  totalCostos: number;
  costoPromedioOrden: number;
  materiales: number;
  manoObra: number;
  indirectos: number;
}

export interface TiemposKPIDTO {
  horasPlanificadas: number;
  horasReales: number;
  cumplimiento: number;
}

export interface SerieTemporalDTO {
  fecha: Date;
  valor: number;
}

export interface ProduccionKPIDTO {
  ordenesFinalizadas: number;
  eficiencia: number;
  desperdicio: number;
  horasPromedio: number;
}

export interface DashboardConsolidadoDTO {
  produccion: ProduccionKPIDTO;
  costos: CostosKPIDTO;
  tiempos: TiemposKPIDTO;
}
