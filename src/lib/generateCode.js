import {
  degradadoCss,
  estilosToStyleObject,
  factorSubtitulo,
  factorTitulo,
  paddingBloque,
} from './estilos.js'
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
// Layout del bloque: la estructura es fija, pero el padding lo elige el
// usuario. Vivir acá evita que preview y snippet tengan valores distintos.
/**
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
const layoutFijo = (estilos) => [
  'display: flex;',
  'flex-direction: column;',
  `padding: ${paddingBloque(estilos)};`,
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
 * Hojas de Google Fonts necesarias: la del cuerpo y, si el título o el
 * subtítulo tienen fuente propia, también las de ellos. Sin duplicados si
 * comparten la misma web.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string[]}
 */
function enlacesFuente(estilos) {
  const familias = [estilos.family]
  if (estilos.tituloFamilia !== 'heredar') {
    familias.push(estilos.tituloFamilia)
  }
  if (estilos.subtituloFamilia !== 'heredar') {
    familias.push(estilos.subtituloFamilia)
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
    ...layoutFijo(estilos),
  ].map((declaracion) => `    ${declaracion}`)

  const factorSub = factorSubtitulo(estilos.escalaSubtitulo)
  const subtituloPropio =
    estilos.subtituloFamilia !== 'heredar' ||
    estilos.subtituloPeso !== 'heredar' ||
    estilos.subtituloColor !== '' ||
    factorSub !== 1.17
  const conDegradado = estilos.degradado === 'degradado'
  const conColumnas = estilos.columnas === 'dos'

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
    // el subtítulo solo genera regla cuando el usuario lo separó del cuerpo:
    // con los defaults el h3 conserva el 1.17em y el bold del navegador
    ...(subtituloPropio
      ? [
          ``,
          `  .texto h3 {`,
          // siempre se fija el tamaño al emitir la regla: así un reset de CSS
          // que cambie el h3 no altera el 1.17em de partida
          `    font-size: ${factorSub}em;`,
          ...(estilos.subtituloFamilia === 'heredar'
            ? []
            : [`    font-family: ${estilos.subtituloFamilia};`]),
          ...(estilos.subtituloPeso === 'heredar'
            ? []
            : [`    font-weight: ${estilos.subtituloPeso};`]),
          ...(estilos.subtituloColor === ''
            ? []
            : [`    color: ${estilos.subtituloColor};`]),
          `  }`,
        ]
      : []),
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
    // selección personalizada: solo se emite si el usuario la activó. El
    // -webkit-text-fill-color mantiene visible el texto seleccionado cuando
    // además hay degradado (el relleno normal es transparente).
    ...(estilos.seleccion === 'personalizada'
      ? [
          ``,
          `  .texto ::selection {`,
          `    background-color: ${estilos.seleccionFondo};`,
          `    color: ${estilos.seleccionTexto};`,
          `    -webkit-text-fill-color: ${estilos.seleccionTexto};`,
          `  }`,
        ]
      : []),
    // degradado de texto: va en los hijos y no en el bloque para que el fondo
    // sólido del article siga viéndose. Con "none" no se emite nada y el
    // snapshot por defecto no cambia.
    ...(conDegradado
      ? [
          ``,
          `  .texto h2,`,
          `  .texto h3,`,
          `  .texto p {`,
          `    background-image: ${degradadoCss(estilos)};`,
          `    -webkit-background-clip: text;`,
          `    background-clip: text;`,
          `    -webkit-text-fill-color: transparent;`,
          `    color: transparent;`,
          `  }`,
        ]
      : []),
    // sin selección propia, el navegador elige el fondo de la selección pero
    // el relleno transparente del degradado lo dejaría invisible
    ...(conDegradado && estilos.seleccion !== 'personalizada'
      ? [
          ``,
          `  .texto ::selection {`,
          `    -webkit-text-fill-color: HighlightText;`,
          `  }`,
        ]
      : []),
    // dos columnas: column-count no funciona en un contenedor flex, así que el
    // layout pasa a block y los títulos ocupan todo el ancho. Con "una" no se
    // emite nada y el snapshot por defecto no cambia.
    ...(conColumnas
      ? [
          ``,
          `  .texto {`,
          `    display: block;`,
          `    column-count: 2;`,
          `    column-gap: 2em;`,
          `  }`,
          ``,
          `  .texto h2,`,
          `  .texto h3 {`,
          `    column-span: all;`,
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
