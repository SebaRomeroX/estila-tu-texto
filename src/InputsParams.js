const OPCIONES_FUENTE = [
  { nombre: 'Times New Roman', contenido: 'Times New Roman, Times, serif' },
  { nombre: 'Georgia', contenido: 'Georgia, serif' },
  { nombre: 'Garamond', contenido: 'Garamond, serif' },
  { nombre: 'Palatino', contenido: 'Palatino, Palatino Linotype, serif' },
  { nombre: 'Arial', contenido: 'Arial, Helvetica, sans-serif' },
  { nombre: 'Helvetica', contenido: 'Helvetica, sans-serif' },
  { nombre: 'Verdana', contenido: 'Verdana, Geneva, sans-serif' },
  { nombre: 'Open Sans', contenido: 'Open Sans, sans-serif' },
  { nombre: 'Roboto', contenido: 'Roboto, sans-serif' },
  { nombre: 'Segoe UI', contenido: 'Segoe UI, Tahoma, sans-serif' },
  { nombre: 'Courier New', contenido: 'Courier New, Courier, monospace' },
  { nombre: 'Consolas', contenido: 'Consolas, Monaco, monospace' },
  { nombre: 'Monaco', contenido: 'Monaco, monospace' },
  { nombre: 'Comic Sans MS', contenido: 'Comic Sans MS, cursive' },
  { nombre: 'Brush Script', contenido: 'Brush Script MT, cursive' },
  { nombre: 'Papyrus', contenido: 'Papyrus, fantasy' },
  { nombre: 'Serif (genérica)', contenido: 'serif' },
  { nombre: 'Sans-serif (genérica)', contenido: 'sans-serif' },
  { nombre: 'Monospace (genérica)', contenido: 'monospace' },
  { nombre: 'Cursive (genérica)', contenido: 'cursive' },
  { nombre: 'Fantasy (genérica)', contenido: 'fantasy' },
  { nombre: 'System UI', contenido: 'system-ui' },
]

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
    step: 0.1 
  },
  tamaño: {
    label: 'Tamaño',
    campo: 'size',
    min: 1,
    max: 2,
    step: 0.1
  },
  altura: {
    label: 'Altura linea',
    campo: 'height',
    min: 1,
    max: 2, 
    step: 0.1
  },
  espacio: {
    label: 'Espacio letras',
    campo: 'spacing',
    min: 0,
    max: 0.3,
    step: 0.01
  },
}

/** @type {Record<string, import('./types.js').ElementoInput>} */
export const InputsSelectsParams = {
  align: {
    label: 'Posicion texto',
    campo: 'align',
    opciones: [
      {nombre: 'inicio', contenido: 'left'},
      {nombre: 'centrado', contenido: 'center'}
    ],
  },
  fuente: {
    label: 'Fuente',
    campo: 'family',
    opciones: OPCIONES_FUENTE,
  },
  peso: {
    label: 'Ancho letra',
    campo: 'weight',
    opciones: [
      {nombre: '100', contenido: 100},
      {nombre: '400', contenido: 400},
      {nombre: '600', contenido: 600},
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
}