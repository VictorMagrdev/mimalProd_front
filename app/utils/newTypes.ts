export type Option = { value: string; label: string };
export interface SimpleEntity<ID = string, Name = string> {
  id: ID;
  nombre: Name;
}
interface baseEntity {
  codigo: string;
  nombre: string;
}
export type NamedEntity = SimpleEntity;

export type IncidenciaOptionsResult = {
  tiposIncidencia: Option[];
  estadosIncidencia: Option[];
  maquinas: Option[];
  ordenesProduccion: Option[];
  estacionesProduccion: Option[];
};

export type BodegaOptionsResult = { tiposBodega: Option[] };
export type ConteoCiclicoOptionsResult = {
  productos: Option[];
  bodegas: Option[];
  lotesProduccion: Option[];
  unidadesMedida: Option[];
};
export type CostoOptionsResult = {
  tiposCosto: Option[];
  ordenesProduccion: Option[];
};
export type DiscrepanciaOptionsResult = { conteosCiclico: Option[] };
export type InventarioOptionsResult = {
  productos: Option[];
  lotesProduccion: Option[];
  bodegas: Option[];
  unidadesMedida: Option[];
};
export type LineaOptionsResult = {
  productos: Option[];
  unidadesMedida: Option[];
};
export type LoteOptionsResult = { productos: Option[] };
export type MovimientoOptionsResult = {
  bodegas: Option[];
  tiposMovimiento: Option[];
};
export type OrdenEstacionOptionsResult = {
  ordenesProduccion: Option[];
  estacionesProduccion: Option[];
  estadosOrdenEstacion: Option[];
};
export type OrdenOptionsResult = { ordenesProduccion: Option[] };
export type OrdenProdOptionsResult = {
  unidadesMedida: Option[];
  estadosOrden: Option[];
  productos: Option[];
};
export type ProductoOptionsResult = {
  tiposProducto: Option[];
  metodosValoracion: Option[];
  unidadesMedida: Option[];
};
export type PuntoOptionsResult = {
  productos: Option[];
  unidadesMedida: Option[];
};
export type ReservaOptionsResult = {
  ordenesProduccion: Option[];
  productos: Option[];
  lotesProduccion: Option[];
  unidadesMedida: Option[];
};
export type ConversionOptionsResult = { unidadesMedida: Option[] };
export type TipoUnidadOptionsResult = { unidadesMedidaTipo: Option[] };

type CreateResult<T extends string> = {
  [K in T]: { id: string };
};

export type CreateEstacionResult = CreateResult<"createEstacionProduccion">;
export type CreateEstadoIncidenciaResult =
  CreateResult<"createEstadoIncidencia">;
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
}

enum fileFormat {
  foto = "FOTO",
  audio = "AUDIO",
}
export interface Archivo {
  id: string;
  tipo: fileFormat;
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
  archivos: Archivo[];
}
export interface Incidencia {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipoIncidencia?: NamedEntity;
  estado?: NamedEntity;
  maquina?: NamedEntity;
  orden?: NamedEntity;
  estacion?: NamedEntity;
  fechaCierre?: string;
  tiempoParada?: string;
  incidenciasArchivo: IncidenciaArchivo[];
}
export type CentroCostoOption = SimpleEntity;
export type TipoProductoOption = SimpleEntity;
export type MetodoValoracionOption = SimpleEntity;
export type UnidadMedidaOption = SimpleEntity;
export type ProductoOption = SimpleEntity;
export type RoleOption = SimpleEntity;
export type TagOption = SimpleEntity;
export type UnidadOption = SimpleEntity;
export type BodegaOption = SimpleEntity;

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  costoBase: number;
  creadoEn: string;
  tipo: TipoProducto;
  metodoValoracion: MetodoValoracion;
  unidadBase: UnidadMedida;
}

export interface Bodega {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoBodegaId: string;
  creadoEn: string;
  tipo: {
    nombre: string;
  };
}
export interface Permission {
  id: number;
  action: string;
  description: string;
}

export interface ConteoCiclico {
  id: string;
  productoId: string;
  bodegaId: string;
  loteId?: string;
  cantidadContada: number;
  unidadId: string;
  fecha: string;
  producto?: baseEntity;
  bodega?: {
    nombre: string;
  };
  lote?: {
    numeroLote: string;
  };
  unidad?: {
    nombre: string;
    abreviatura: string;
  };
}

export interface CostoOrden {
  id: string;
  ordenId: string;
  tipoCostoId: string;
  descripcion: string;
  monto: number;
  moneda: string;
  registradoEn: string;
  tipoCosto: baseEntity;
  orden?: {
    numeroOrden: string;
  };
}

export interface DiscrepanciaInventario {
  id: string;
  conteoId: string;
  cantidadSistema: number;
  resuelto: boolean;
  conteo: {
    fecha: string;
    cantidadContada: number;
    producto: baseEntity;
    unidad?: {
      abreviatura: string;
    };
  };
}

export interface EstacionProduccion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  creadoEn: string;
}

export interface EstadoIncidencia {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  estadoFinal: boolean;
}

export interface EstadoOrden {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Estructura {
  id: string;
  productoPadreNombre: string;
  productoHijoNombre: string;
  cantidad: number;
  unidadNombre?: string;
  version?: string;
  activo: boolean;
}

export interface IncidenciaArchivo {
  id: string;
  tipo: string;
  nombreOriginal: string;
  url: string;
}

interface Lote {
  id: string;
}

export interface InventarioLote {
  id: string;
  lote?: Lote;
  producto?: Producto;
  bodega?: Bodega;
  unidad?: UnidadOption;
  cantidad: number;
}

export interface LineaOrden {
  id: string;
  ordenId?: string;
  numeroLinea?: number;
  productoComponente?: NamedEntity;
  cantidadRequerida?: number;
  unidadComponente?: { id: string; abreviatura?: string };
  cantidadUsada?: number;
  costoUnitario?: number;
  costoTotal?: number;
  observaciones?: string;
}

export interface LoteProduccion {
  id: string;
  numeroLote: string;
  productoId?: string;
  fabricadoEn?: string;
  venceEn?: string;
  creadoEn?: string;
  producto?: NamedEntity;
}

export interface MetodoValoracion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  productos?: Producto[];
}

export interface MovimientoInventarioDetalle {
  id: string;
  productoId?: string;
  cantidad?: number;
  unidadId?: string;
}

export interface MovimientoInventario {
  id: string;
  fecha?: string;
  bodegaOrigen?: NamedEntity;
  bodegaDestino?: NamedEntity;
  tipoMovimiento?: NamedEntity;
  referencia?: string;
  observaciones?: string;
  creadoPor?: string;
  creadoEn?: string;
  detalles?: MovimientoInventarioDetalle[];
}

export interface OrdenEstacion {
  id: string;
  ordenId?: string;
  estacionId?: string;
  inicioPlanificado?: string;
  finPlanificado?: string;
  inicioReal?: string;
  finReal?: string;
  estadoOrdenEstacionId?: string;
  observaciones?: string;
  estacion?: NamedEntity;
  estado?: NamedEntity;
}

export interface OrdenEvento {
  id: string;
  ordenId?: string;
  evento: string;
  descripcion?: string;
  fecha?: string;
}

export interface OrdenProduccion {
  id: string;
  numeroOrden: string;
  cantidad?: number;
  unidad?: { id: string; abreviatura?: string };
  estado?: NamedEntity;
  inicioPlanificado?: string;
  finPlanificado?: string;
  inicioReal?: string;
  finReal?: string;
  cantidadDesperdicio?: number;
  cantidadProducida?: number;
  creadoEn?: string;
}

export interface ParametroPlanificacion {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  leadTimeDias: number;
  loteMinimo: number;
  loteEconomico: number;
  politicaInventario: string;
  actualizadoEn: string;
}

export interface PuntoReorden {
  id: string;
  productoId: string;
  stockMinimo: number;
  stockSeguridad: number;
  unidadId: string;
}

export interface RequerimientoMaterial {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  ordenProduccionId?: string;
  ordenProduccionCodigo?: string;
  cantidadRequerida: number;
  cantidadDisponible: number;
  cantidadAPedir: number;
  fechaNecesidad?: string;
  creadoEn: string;
}

export interface ReservaMaterialOrden {
  id: string;
  ordenId: string;
  productoId: string;
  loteId: string;
  cantidadReservada: number;
  unidadId: string;
  fechaReserva: string;
}

interface TipoBodega {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface TipoCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  creadoEn?: string;
}

interface TipoIncidencia {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  prioridadBase: string;
}

export interface TipoMovimiento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  afecta_wip: boolean;
  creadoEn: string;
}

export interface TipoProducto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface UnidadConversion {
  id: string;
  factor: number;
  origen: NamedEntity;
  destino: NamedEntity;
}

export interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  abreviatura?: string;
  tipo?: NamedEntity;
  activa?: boolean;
  base?: boolean;
  creadoEn?: string;
}

interface UnidadMedidaTipo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Policy {
  id: number;
  rol: NamedEntity;
  tag: NamedEntity;
  permiso: { id: number; accion: string };
}

export interface UserLite {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
export interface User {
  id: number;
  username: string;
  email: string;
  telefono?: string;
  codigoEmpleado?: string;
  nombre?: string;
  apellidos?: string;
  centroCostoId?: number;
  capacidadHorasDia?: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  roles: Rol[];
}
export type QueryResult<K extends string, T> = {
  [P in K]: T[];
};

export type MetodoValoracionQueryResult = QueryResult<
  "metodosValoracion",
  MetodoValoracion
>;

export type InventarioLoteQueryResult = QueryResult<
  "inventariosLote",
  InventarioLote
>;

export type IncidenciaQueryResult = QueryResult<"incidencias", Incidencia>;

export type UnidadesMedidaTipoQueryResult = QueryResult<
  "unidadesMedidaTipo",
  UnidadMedidaTipo
>;

export type UnidadesMedidaQueryResult = QueryResult<
  "unidadesMedida",
  UnidadMedida
>;

export type UnidadesConversionQueryResult = QueryResult<
  "unidadesConversion",
  UnidadConversion
>;

export type TipoProductoQueryResult = QueryResult<
  "tiposProducto",
  TipoProducto
>;

export type TipoMovimientoQueryResult = QueryResult<
  "tiposMovimiento",
  TipoMovimiento
>;

export type TipoIncidenciaQueryResult = QueryResult<
  "tiposIncidencia",
  TipoIncidencia
>;

export type TiposCostoQueryResult = QueryResult<"tiposCosto", TipoCosto>;

export type TiposBodegaQueryResult = QueryResult<"tiposBodega", TipoBodega>;

export type ReservaMaterialOrdenQueryResult = QueryResult<
  "reservasMaterialOrden",
  ReservaMaterialOrden
>;

export type RequerimientoMaterialQueryResult = QueryResult<
  "getAllRequerimientos",
  RequerimientoMaterial
>;

export type PuntoReordenQueryResult = QueryResult<
  "puntosReorden",
  PuntoReorden
>;

export type ProductosQueryResult = QueryResult<"productos", Producto>;

export type ParametroPlanificacionQueryResult = QueryResult<
  "getAllParametros",
  ParametroPlanificacion
>;

export type OrdenesProduccionQueryResult = QueryResult<
  "ordenesProduccion",
  OrdenProduccion
>;

export type OrdenEventoQueryResult = QueryResult<"ordenesEvento", OrdenEvento>;

export type OrdenesEstacionQueryResult = QueryResult<
  "ordenesEstacion",
  OrdenEstacion
>;

export type MaquinaQueryResult = QueryResult<"maquinas", Maquina>;

export type ConteoCiclicoQueryResult = QueryResult<
  "conteosCiclicos",
  ConteoCiclico
>;

export type BodegaQueryResult = QueryResult<"bodegas", Bodega>;

export type CostoOrdenQueryResult = QueryResult<"costosOrden", CostoOrden>;

export type DiscrepanciaInventarioQueryResult = QueryResult<
  "discrepanciasInventario",
  DiscrepanciaInventario
>;

export type EstacionProduccionQueryResult = QueryResult<
  "estacionesProduccion",
  EstacionProduccion
>;

export type EstructuraQueryResult = QueryResult<"estructuras", Estructura>;

export type MovimientoInventarioQueryResult = QueryResult<
  "movimientosInventario",
  MovimientoInventario
>;

export type EstadoIncidenciaQueryResult = QueryResult<
  "estadosIncidencia",
  EstadoIncidencia
>;

export type LotesProduccionQueryResult = QueryResult<
  "lotesProduccion",
  LoteProduccion
>;
