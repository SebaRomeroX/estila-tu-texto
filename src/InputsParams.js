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
    label: 'Tamaño',
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
    min: 0,
    max: 0.3,
    step: 0.01,
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
}

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
  peso: {
    label: 'Ancho letra',
    campo: 'weight',
    opciones: [
      { nombre: '100', contenido: 100 },
      { nombre: '400', contenido: 400 },
      { nombre: '600', contenido: 600 },
    ],
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
