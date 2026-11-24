import { FUENTES } from './lib/fuentes.js'

/**
 * Fichas de configuración de cada input. Tipadas como ElementoInput para que
 * `campo` sea CampoEstilo (no string suelto) y el compilador valide los rangos.
 *
 * @type {Record<string, import('./types.js').ElementoInput>}
 */
export const InputsNumberParams = {
  gap: {
    label: 'Espacio elementos',
    campo: 'gap',
    min: 1,
    max: 3,
    step: 0.1,
  },
  tamaño: {
    label: 'Tamaño (rem)',
    campo: 'size',
    min: 1,
    max: 2,
    step: 0.1,
  },
  altura: {
    label: 'Altura linea',
    campo: 'height',
    min: 1,
    max: 2,
    step: 0.1,
  },
  espacio: {
    label: 'Espacio letras',
    campo: 'spacing',
    min: -0.1,
    max: 0.3,
    step: 0.01,
  },
  espacioPalabras: {
    label: 'Espacio palabras (em)',
    campo: 'espacioPalabras',
    min: 0,
    max: 0.5,
    step: 0.01,
  },
  sangria: {
    label: 'Sangría primera línea (em)',
    campo: 'sangria',
    min: 0,
    max: 4,
    step: 0.1,
  },
  ancho: {
    label: 'Ancho linea (ch)',
    campo: 'ancho',
    min: 30,
    max: 90,
    step: 5,
  },
  escalaTitulo: {
    label: 'Tamaño titulo (%)',
    campo: 'escalaTitulo',
    min: 100,
    max: 200,
    step: 5,
  },
  escalaSubtitulo: {
    label: 'Tamaño subtítulo (%)',
    campo: 'escalaSubtitulo',
    min: 100,
    max: 200,
    step: 1,
  },
  paddingVertical: {
    label: 'Padding vertical (px)',
    campo: 'paddingVertical',
    min: 0,
    max: 120,
    step: 5,
  },
  paddingHorizontal: {
    label: 'Padding horizontal (px)',
    campo: 'paddingHorizontal',
    min: 0,
    max: 200,
    step: 5,
  },
}

/** @type {import('./types.js').Opcion[]} */
const OPCIONES_PESO = [
  { nombre: '100', contenido: 100 },
  { nombre: '300', contenido: 300 },
  { nombre: '400', contenido: 400 },
  { nombre: '600', contenido: 600 },
  { nombre: '700', contenido: 700 },
  { nombre: '800', contenido: 800 },
  { nombre: '900', contenido: 900 },
]

// el título puede heredar la fuente del cuerpo o elegir otra del catálogo
/** @type {import('./types.js').Opcion[]} */
const OPCIONES_FUENTE_TITULO = [
  { nombre: 'igual al cuerpo', contenido: 'heredar' },
  ...FUENTES.map(({ nombre, contenido }) => ({ nombre, contenido })),
]

// el peso por defecto del h2 es el bold del navegador, no el del cuerpo
/** @type {import('./types.js').Opcion[]} */
const OPCIONES_PESO_TITULO = [
  { nombre: 'predeterminada (negrita)', contenido: 'heredar' },
  ...OPCIONES_PESO,
]

/** @type {Record<string, import('./types.js').ElementoInput>} */
export const InputsSelectsParams = {
  align: {
    label: 'Posicion texto',
    campo: 'align',
    opciones: [
      { nombre: 'inicio', contenido: 'left' },
      { nombre: 'centrado', contenido: 'center' },
    ],
  },
  fondoTransparente: {
    label: 'Fondo del bloque',
    campo: 'fondoTransparente',
    opciones: [
      { nombre: 'color sólido', contenido: 'no' },
      { nombre: 'transparente', contenido: 'si' },
    ],
  },
  peso: {
    label: 'Ancho letra',
    campo: 'weight',
    opciones: OPCIONES_PESO,
  },
  tituloFamilia: {
    label: 'Fuente título',
    campo: 'tituloFamilia',
    opciones: OPCIONES_FUENTE_TITULO,
  },
  tituloPeso: {
    label: 'Ancho título',
    campo: 'tituloPeso',
    opciones: OPCIONES_PESO_TITULO,
  },
  subtituloFamilia: {
    label: 'Fuente subtítulo',
    campo: 'subtituloFamilia',
    opciones: OPCIONES_FUENTE_TITULO,
  },
  subtituloPeso: {
    label: 'Ancho subtítulo',
    campo: 'subtituloPeso',
    opciones: OPCIONES_PESO_TITULO,
  },
  transform: {
    label: 'Mayusculas',
    campo: 'transform',
    opciones: [
      { nombre: 'ninguna', contenido: 'none' },
      { nombre: 'MAYÚSCULAS', contenido: 'uppercase' },
      { nombre: 'minúsculas', contenido: 'lowercase' },
      { nombre: 'Capitalizar', contenido: 'capitalize' },
    ],
  },
  decoracion: {
    label: 'Decoracion',
    campo: 'decoracion',
    opciones: [
      { nombre: 'ninguna', contenido: 'none' },
      { nombre: 'subrayado', contenido: 'underline' },
      { nombre: 'tachado', contenido: 'line-through' },
    ],
  },
  estiloLetra: {
    label: 'Estilo letra',
    campo: 'estiloLetra',
    opciones: [
      { nombre: 'normal', contenido: 'normal' },
      { nombre: 'cursiva', contenido: 'italic' },
    ],
  },
  versalitas: {
    label: 'Versalitas',
    campo: 'versalitas',
    opciones: [
      { nombre: 'ninguna', contenido: 'none' },
      { nombre: 'versalitas', contenido: 'small-caps' },
    ],
  },
  corteLinea: {
    label: 'Corte de línea',
    campo: 'corteLinea',
    opciones: [
      { nombre: 'normal', contenido: 'wrap' },
      { nombre: 'balanceado', contenido: 'balance' },
      { nombre: 'pretty', contenido: 'pretty' },
    ],
  },
  letraCapitular: {
    label: 'Letra capitular',
    campo: 'letraCapitular',
    opciones: [
      { nombre: 'no', contenido: 'none' },
      { nombre: 'sí (primer párrafo)', contenido: 'primera' },
    ],
  },
  sombra: {
    label: 'Sombra',
    campo: 'sombra',
    opciones: [
      { nombre: 'ninguna', contenido: 'none' },
      { nombre: 'suave', contenido: 'suave' },
      { nombre: 'resplandor', contenido: 'resplandor' },
    ],
  },
  seleccion: {
    label: 'Selección de texto',
    campo: 'seleccion',
    opciones: [
      { nombre: 'predeterminada', contenido: 'none' },
      { nombre: 'personalizada', contenido: 'personalizada' },
    ],
  },
}

/** @type {Record<string, import('./types.js').ElementoInput>} */
export const InputsColorParams = {
  color: {
    label: 'Color letra',
    campo: 'color',
  },
  fondo: {
    label: 'Color fondo',
    campo: 'background',
  },
  seleccionFondo: {
    label: 'Fondo selección',
    campo: 'seleccionFondo',
  },
  seleccionTexto: {
    label: 'Texto seleccionado',
    campo: 'seleccionTexto',
  },
}
