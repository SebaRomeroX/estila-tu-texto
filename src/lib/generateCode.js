import { estilosToStyleObject, factorTitulo } from './estilos.js'
import { enlaceGoogleFonts } from './fuentes.js'

/**
 * Escapa texto del usuario para inyectarlo seguro dentro del HTML del snippet.
 * El orden importa: & primero, para no escapar dos veces los ya escapados.
 *
 * @param {*} texto
 * @returns {string}
 */
export function escapeHtml(texto) {
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
  'margin-inline: auto;',
]

/**
 * @param {import('../types.js').Texto} texto
 * @returns {string[]}
 */
function generarArticulo(texto) {
  const { titulo, parrafo1, parrafo2, subtitulo, parrafo3 } = texto

  return [
    `<article class='texto'>`,
    `  <h2>${escapeHtml(titulo)}</h2>`,
    `  <p>${escapeHtml(parrafo1)}</p>`,
    `  <p>${escapeHtml(parrafo2)}</p>`,
    `  <h3>${escapeHtml(subtitulo)}</h3>`,
    `  <p>${escapeHtml(parrafo3)}</p>`,
    `</article>`,
  ]
}

/**
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function generarCss(estilos) {
  const declaracionesCss = [
    ...Object.entries(estilosToStyleObject(estilos)).map(
      ([propiedad, valor]) => `${camelToKebab(propiedad)}: ${valor};`,
    ),
    ...LAYOUT_FIJO,
  ].map((declaracion) => `    ${declaracion}`)

  return [
    `<style>`,
    `  .texto {`,
    ...declaracionesCss,
    `  }`,
    ``,
    // regla explícita del título: sin esto depende del UA y se rompe con
    // cualquier reset (Tailwind preflight, normalize...)
    `  .texto h2 {`,
    `    font-size: ${factorTitulo(estilos.escalaTitulo)}em;`,
    `  }`,
    `</style>`,
  ]
}

/**
 * Genera el snippet HTML+CSS a partir del MISMO estado que alimenta el
 * preview. Es la única fuente de verdad: sirve para el <pre> y para copiar.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function generateCode(texto, estilos) {
  const enlaceFuente = enlaceGoogleFonts(estilos.family)

  return [
    // solo para fuentes web: sin esta hoja el snippet se ve distinto fuera de
    // la app (el navegador cae al fallback). Las del sistema no la necesitan.
    ...(enlaceFuente
      ? [
          `<!-- Fuente web: carga esta hoja para que el texto se vea igual fuera de la app -->`,
          `<link rel="stylesheet" href="${enlaceFuente}">`,
          ``,
        ]
      : []),
    ...generarArticulo(texto),
    ``,
    ...generarCss(estilos),
  ].join('\n')
}

/**
 * Documento HTML completo y autónomo para descargar: a diferencia del snippet,
 * el <style> y el <link> de la fuente van en el <head>, como corresponde.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function generateDocumento(texto, estilos) {
  const enlaceFuente = enlaceGoogleFonts(estilos.family)
  const titulo = texto.titulo.trim() || 'Estila tu Texto'

  return [
    `<!doctype html>`,
    `<html lang="es">`,
    `<head>`,
    `  <meta charset="utf-8">`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1">`,
    `  <title>${escapeHtml(titulo)}</title>`,
    ...(enlaceFuente
      ? [`  <link rel="stylesheet" href="${enlaceFuente}">`]
      : []),
    ...generarCss(estilos).map((linea) => (linea ? `  ${linea}` : '')),
    `</head>`,
    `<body>`,
    ...generarArticulo(texto).map((linea) => `  ${linea}`),
    `</body>`,
    `</html>`,
    ``,
  ].join('\n')
}
