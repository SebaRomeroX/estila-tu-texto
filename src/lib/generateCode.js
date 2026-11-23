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
 * Hojas de Google Fonts necesarias: la del cuerpo y, si el título tiene fuente
 * propia, también la del título. Sin duplicados si ambos usan la misma web.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function enlacesFuente(estilos) {
  const familias = [estilos.family]
  if (estilos.tituloFamilia !== 'heredar') {
    familias.push(estilos.tituloFamilia)
  }

  /** @type {string[]} */
  const enlaces = []
  for (const familia of familias) {
    const enlace = enlaceGoogleFonts(familia)
    if (enlace && !enlaces.includes(enlace)) enlaces.push(enlace)
  }

  return enlaces
}

/**
 * Reglas CSS interiores del snippet (sin las etiquetas <style>).
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function generarCssReglas(estilos) {
  const declaracionesCss = [
    ...Object.entries(estilosToStyleObject(estilos)).map(
      ([propiedad, valor]) => `${camelToKebab(propiedad)}: ${valor};`,
    ),
    ...LAYOUT_FIJO,
  ].map((declaracion) => `    ${declaracion}`)

  return [
    `  .texto {`,
    ...declaracionesCss,
    `  }`,
    ``,
    // regla explícita del título: sin esto depende del UA y se rompe con
    // cualquier reset (Tailwind preflight, normalize...). Fuente, peso y color
    // solo se emiten si el usuario los separó del cuerpo: el snapshot por
    // defecto no cambia.
    `  .texto h2 {`,
    `    font-size: ${factorTitulo(estilos.escalaTitulo)}em;`,
    ...(estilos.tituloFamilia === 'heredar'
      ? []
      : [`    font-family: ${estilos.tituloFamilia};`]),
    ...(estilos.tituloPeso === 'heredar'
      ? []
      : [`    font-weight: ${estilos.tituloPeso};`]),
    ...(estilos.tituloColor === ''
      ? []
      : [`    color: ${estilos.tituloColor};`]),
    `  }`,
    ``,
    // sangría solo en párrafos: text-indent se hereda y en el contenedor
    // también indentaría los títulos
    `  .texto p {`,
    `    text-indent: ${estilos.sangria}em;`,
    `  }`,
    // capitular editorial: solo la primera letra del primer párrafo. Con
    // "none" no se emite nada y el snapshot por defecto no cambia.
    ...(estilos.letraCapitular === 'primera'
      ? [
          ``,
          `  .texto p:first-of-type::first-letter {`,
          `    float: left;`,
          `    font-size: 3.2em;`,
          `    line-height: 0.9;`,
          `    padding-right: 0.08em;`,
          `  }`,
        ]
      : []),
    // selección personalizada: solo se emite si el usuario la activó
    ...(estilos.seleccion === 'personalizada'
      ? [
          ``,
          `  .texto ::selection {`,
          `    background-color: ${estilos.seleccionFondo};`,
          `    color: ${estilos.seleccionTexto};`,
          `  }`,
        ]
      : []),
  ]
}

/**
 * Bloque <style> completo (reglas envueltas), para el snippet y el documento.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function generarCss(estilos) {
  return [`<style>`, ...generarCssReglas(estilos), `</style>`]
}

/**
 * Parte HTML del snippet, con la hoja de la fuente web si corresponde.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function generarHtmlConFuente(texto, estilos) {
  const enlaces = enlacesFuente(estilos)
  const comentario =
    enlaces.length > 1
      ? `<!-- Fuentes web: carga estas hojas para que el texto se vea igual fuera de la app -->`
      : `<!-- Fuente web: carga esta hoja para que el texto se vea igual fuera de la app -->`

  return [
    // solo para fuentes web: sin esta hoja el snippet se ve distinto fuera de
    // la app (el navegador cae al fallback). Las del sistema no la necesitan.
    ...(enlaces.length > 0
      ? [
          comentario,
          ...enlaces.map(
            (enlace) => `<link rel="stylesheet" href="${enlace}">`,
          ),
          ``,
        ]
      : []),
    ...generarArticulo(texto),
  ]
}

/**
 * HTML del snippet listo para copiar por separado (sin el <style>).
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function generateHtml(texto, estilos) {
  return generarHtmlConFuente(texto, estilos).join('\n')
}

/**
 * CSS del snippet listo para copiar por separado (sin las etiquetas <style>).
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function generateCss(estilos) {
  return generarCssReglas(estilos).join('\n')
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
  return [
    ...generarHtmlConFuente(texto, estilos),
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
  const enlaces = enlacesFuente(estilos)
  const titulo = texto.titulo.trim() || 'Estila tu Texto'

  return [
    `<!doctype html>`,
    `<html lang="es">`,
    `<head>`,
    `  <meta charset="utf-8">`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1">`,
    `  <title>${escapeHtml(titulo)}</title>`,
    ...enlaces.map((enlace) => `  <link rel="stylesheet" href="${enlace}">`),
    ...generarCss(estilos).map((linea) => (linea ? `  ${linea}` : '')),
    `</head>`,
    `<body>`,
    ...generarArticulo(texto).map((linea) => `  ${linea}`),
    `</body>`,
    `</html>`,
    ``,
  ].join('\n')
}
