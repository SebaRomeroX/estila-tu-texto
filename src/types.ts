/**
 * Tipos del dominio del proyecto. Fuente única de las formas que circulan
 * entre context, componentes y la generación de código.
 */

export interface Estilos {
  color: string
  background: string
  family: string
  size: string
  weight: string
  spacing: string
  height: string
  gap: string
  align: string
  ancho: string
  transform: string
  decoracion: string
  estiloLetra: string
  escalaTitulo: string
  sangria: string
  espacioPalabras: string
  versalitas: string
  corteLinea: string
  letraCapitular: string
  sombra: string
  sombraX: string
  sombraY: string
  sombraDifuminado: string
  sombraColor: string
  seleccion: string
  seleccionFondo: string
  seleccionTexto: string
  tituloFamilia: string
  tituloPeso: string
  tituloColor: string
  subtituloFamilia: string
  subtituloPeso: string
  subtituloColor: string
  escalaSubtitulo: string
  degradado: string
  degradadoInicio: string
  degradadoFin: string
  columnas: string
  opacidad: string
  borde: string
  bordeAncho: string
  bordeColor: string
  bordeRadio: string
  contorno: string
  contornoAncho: string
  contornoColor: string
  animacion: string
  glass: string
  paddingVertical: string
  paddingHorizontal: string
  fondoTransparente: string
}

export type CampoEstilo = keyof Estilos

export interface Texto {
  titulo: string
  parrafo1: string
  parrafo2: string
  subtitulo: string
  parrafo3: string
}

export type CampoTexto = keyof Texto

export interface PlantillaTexto {
  id: string
  nombre: string
  texto: Texto
}

export interface ContextoEstilos {
  estilos: Estilos
  actualizarEstilos: (campo: CampoEstilo, valor: string) => void
  aplicarEstilos: (nuevos: Estilos) => void
  /** estados de la sesión (incluye el actual) */
  historial: Estilos[]
  /** posición del estado actual */
  indiceHistorial: number
  puedeDeshacer: boolean
  puedeRehacer: boolean
  deshacer: () => void
  rehacer: () => void
  irAHistorial: (indice: number) => void
  /** deja solo el estado actual */
  limpiarHistorial: () => void
}

export interface Preset {
  id: string
  nombre: string
  estilos: Estilos
}

export interface PresetPropio {
  /** clave única (sin distinguir mayúsculas) */
  nombre: string
  estilos: Estilos
}

export type TipoToken =
  | 'etiqueta'
  | 'atributo'
  | 'valor-html'
  | 'texto'
  | 'selector'
  | 'propiedad'
  | 'valor-css'
  | 'puntuacion'

export interface Token {
  tipo: TipoToken
  texto: string
}

export interface Rgb {
  r: number
  g: number
  b: number
}

export type NivelContraste = 'AAA' | 'AA' | 'AA (texto grande)' | 'Insuficiente'

export interface ResultadoContraste {
  ratio: number
  nivel: NivelContraste
}

export interface Opcion {
  nombre: string
  contenido: string | number
}

export interface Fuente {
  nombre: string
  /** pila CSS que se guarda y se emite */
  contenido: string
  /** true si se self-hostea en public/fonts */
  web: boolean
  /** familia para la CSS2 API de Google Fonts */
  google?: string
  /** etiqueta del <optgroup> */
  grupo: string
}

export interface ElementoInput {
  label: string
  campo: CampoEstilo
}

export type ElementoInputNumber = ElementoInput & {
  min: number
  max: number
  step: number
}

export type ElementoInputSelect = ElementoInput & {
  opciones: Opcion[]
}

export interface ParametrosInput {
  elemento: ElementoInput
}

export interface ParametrosInputNumber {
  elemento: ElementoInputNumber
}

export interface ParametrosInputSelect {
  elemento: ElementoInputSelect
}

export interface ParametrosEditableText {
  /** etiqueta HTML a renderizar (default: p) */
  etiqueta?: string
  /** nombre accesible del campo editable */
  nombre?: string
  valor: string
  onCambio: (valor: string) => void
}

export interface ParametrosVisualizador {
  texto: Texto
  actualizarTexto: (campo: CampoTexto, valor: string) => void
  restablecerTexto: () => void
  cargarTexto: (nuevo: Texto) => void
}

export interface ParametrosSalida {
  texto: Texto
}

export type Idioma = 'es' | 'en'
export type DatosTraduccion = Record<string, string | number>

export interface ContextoIdioma {
  idioma: Idioma
  cambiarIdioma: (idioma: string) => void
  t: (texto: string, datos?: DatosTraduccion) => string
}

export interface EstadoCompartido {
  texto: Texto
  estilos: Estilos
}
