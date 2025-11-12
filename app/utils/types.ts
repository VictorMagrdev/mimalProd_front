// ----------------------------
// Tipos base
// ----------------------------
export type Option = { value: string | number; label: string };
export type SelectOption = { value: string; label: string };

// ----------------------------
// Opciones de selección
// ----------------------------
export type IncidenciaOptionsResult = {
  tiposIncidencia: Option[];
  estadosIncidencia: Option[];
  maquinas: Option[];
  ordenesProduccion: Option[];
  estacionesProduccion: Option[];
};

export type BodegaOptionsResult = { tiposBodega: SelectOption[] };
export type ConteoCiclicoOptionsResult = {
  productos: SelectOption[];
  bodegas: SelectOption[];
  lotesProduccion: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type CostoOptionsResult = {
  tiposCosto: Option[];
  ordenesProduccion: Option[];
};
export type DiscrepanciaOptionsResult = { conteosCiclico: Option[] };
export type InventarioOptionsResult = {
  productos: SelectOption[];
  lotesProduccion: SelectOption[];
  bodegas: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type LineaOptionsResult = {
  productos: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type LoteOptionsResult = { productos: SelectOption[] };
export type MovimientoOptionsResult = {
  bodegas: SelectOption[];
  tiposMovimiento: SelectOption[];
};
export type OrdenEstacionOptionsResult = {
  ordenesProduccion: SelectOption[];
  estacionesProduccion: SelectOption[];
  estadosOrdenEstacion: SelectOption[];
};
export type OrdenOptionsResult = { ordenesProduccion: SelectOption[] };
export type OrdenProdOptionsResult = {
  unidadesMedida: SelectOption[];
  estadosOrden: SelectOption[];
  productos: SelectOption[];
};
export type ProductoOptionsResult = {
  tiposProducto: SelectOption[];
  metodosValoracion: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type PuntoOptionsResult = {
  productos: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type ReservaOptionsResult = {
  ordenesProduccion: SelectOption[];
  productos: SelectOption[];
  lotesProduccion: SelectOption[];
  unidadesMedida: SelectOption[];
};
export type ConversionOptionsResult = { unidadesMedida: SelectOption[] };
export type TipoUnidadOptionsResult = { unidadesMedidaTipo: SelectOption[] };

// ----------------------------
// Resultados de creación
// ----------------------------
type CreateResult<T extends string> = {
  [K in T]: { id: string }
};

// Ejemplos de uso
export type CreateEstacionResult = CreateResult<"createEstacionProduccion">;
export type CreateEstadoIncidenciaResult = CreateResult<"createEstadoIncidencia">;
export type CreateBodegaResult = CreateResult<"createBodega">;
export type CreateConteoResult = CreateResult<"createConteoCiclico">;
export type CreateCostoResult = CreateResult<"createCostoOrden">;
export type CreateDiscResult = CreateResult<"createDiscrepanciaInventario">;
export type CreateInventarioResult = CreateResult<"createInventarioLote">;
export type CreateLineaResult = CreateResult<"createLineaOrden">;
export type CreateLoteResult = CreateResult<"createLoteProduccion">;
export type CreateMaquinaResult = CreateResult<"createMaquina">;
export type CreateMetodoResult = CreateResult<"createMetodoValoracion">;
export type CreateMovimientoResult = CreateResult<"createMovimientoInventario">;
export type CreateOrdenEstacionResult = CreateResult<"createOrdenEstacion">;
export type CreateEventoResult = CreateResult<"createOrdenEvento">;
export type CreateOrdenResult = CreateResult<"createOrdenProduccion">;
export type CreateProductoResult = CreateResult<"createProducto">;
export type CreatePuntoResult = CreateResult<"createPuntoReorden">;
export type CreateReservaResult = CreateResult<"createReservaMaterialOrden">;
export type CreateTipoBodegaResult = CreateResult<"createTipoBodega">;
export type CreateTipoCostoResult = CreateResult<"createTipoCosto">;
export type CreateTipoIncidenciaResult = CreateResult<"crearTipoIncidencia">;
export type CreateTipoMovimientoResult = CreateResult<"createTipoMovimiento">;
export type CreateTipoProductoResult = CreateResult<"createTipoProducto">;
export type CreateConversionResult = CreateResult<"createUnidadConversion">;
export type CreateUnidadResult = CreateResult<"createUnidadMedida">;
export type CreateTipoResult = CreateResult<"createUnidadMedidaTipo">;

// ----------------------------
// DTOs de producción, costos y tiempos
// ----------------------------
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

export interface ProduccionKPIDTO {
  ordenesFinalizadas: number;
  eficiencia: number;
  desperdicio: number;
  horasPromedio: number;
}

export interface SerieTemporalDTO {
  fecha: Date;
  valor: number;
}

export interface DashboardConsolidadoDTO {
  produccion: ProduccionKPIDTO;
  costos: CostosKPIDTO;
  tiempos: TiemposKPIDTO;
}

// ----------------------------
// Gráficos
// ----------------------------
export interface ChartSeries {
  id: string;
  nombre: string;
  color: string;
}

export interface ChartDataPoint {
  xValue: number | string;
  [key: string]: number | string | undefined;
}

export interface PuntoGrafico {
  año: number;
  fecha: string;
  valorEnLibros: number;
  valorDepreciacion: number;
  valorAcumulado: number;
  tipo: "Real" | "Proyectado";
}

// ----------------------------
// Maquinas y depreciación
// ----------------------------
export interface Depreciacion {
  id: string;
  maquinaId: string;
  periodo: string;
  depreciacionPeriodo: string;
  depreciacionAcumulada: string;
  valorNeto: string;
}

export interface Maquina {
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

export interface CentroCosto {
  id: string;
  nombre: string;
}

// ----------------------------
// Incidencias y archivos
// ----------------------------
export interface Archivo {
  id: string;
  tipo: "FOTO" | "AUDIO";
  nombreOriginal: string;
  url: string;
}

export interface Incidencia {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipoIncidenciaId?: string;
  estadoId?: string;
  maquinaId?: string;
  creadoEn: string;
  archivos: Archivo[];
}

// ----------------------------
// Roles, tags y permisos
// ----------------------------
export interface Role {
  id: number;
  name: string;
}
export interface Tag {
  id: number;
  name: string;
}
export interface Permission {
  id: number;
  action: string;
  description: string;
}
