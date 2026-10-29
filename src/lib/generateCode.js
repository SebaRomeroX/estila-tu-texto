import { estilosToStyleObject } from './estilos.js'

/**
 * Escapa texto del usuario para inyectarlo seguro dentro del HTML del snippet.
 * El orden importa: & primero, para no escapar dos veces los ya escapados.
 *
 * @param {*} texto
 * @returns {string}
 */
export function escapeHtml (texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * @param {string} propiedad
 * @returns {string}
 */
const camelToKebab = (propiedad) =>
  propiedad.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`)

// Layout fijo del bloque de texto: no es configurable por el usuario, por eso
// vive acá como boilerplate y no en estilosToStyleObject.
const LAYOUT_FIJO = [
  'display: flex;',
  'flex-direction: column;',
  'padding: 30px 60px;',
]

/**
 * Genera el snippet HTML+CSS a partir del MISMO estado que alimenta el
 * preview. Es la única fuente de verdad: sirve para el <pre> y para copiar.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function generateCode (texto, estilos) {
  const { titulo, parrafo1, parrafo2, subtitulo, parrafo3 } = texto

  const declaracionesCss = [
    ...Object.entries(estilosToStyleObject(estilos))
      .map(([propiedad, valor]) => `${camelToKebab(propiedad)}: ${valor};`),
    ...LAYOUT_FIJO,
  ].map(declaracion => `    ${declaracion}`)

  return [
    `<article class='texto'>`,
    `  <h2>${escapeHtml(titulo)}</h2>`,
    `  <p>${escapeHtml(parrafo1)}</p>`,
    `  <p>${escapeHtml(parrafo2)}</p>`,
    `  <h3>${escapeHtml(subtitulo)}</h3>`,
    `  <p>${escapeHtml(parrafo3)}</p>`,
    `</article>`,
    ``,
    `<style>`,
    `  .texto {`,
    ...declaracionesCss,
    `  }`,
    `</style>`,
  ].join('\n')
}
