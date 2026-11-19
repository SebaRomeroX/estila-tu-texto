// Resaltado de sintaxis para el snippet HTML + CSS generado por generateCode.
// Es un tokenizador propio y SIN dependencias, pensado para el formato que
// produce la app (no pretende ser un parser de HTML/CSS completo).
//
// INVARIANTE: concatenar los tokens de una línea reproduce la línea EXACTA.
// De eso depende que el texto del <pre> siga siendo el código copiable.

const RE_ETIQUETA = /<\/?[a-zA-Z][^>]*>/g

// nombre de etiqueta | atributo="valor" | cierre (> o />)
const RE_PARTES = /<\/?([a-zA-Z][\w-]*)|([\w-]+)=(['"])([^'"]*)\3|(\/?>)/g

// "  prop: valor;"  (solo propiedades simples, que es lo que generamos)
const RE_CSS_PROPIEDAD = /^(\s*)([a-z-]+)(:\s*)(.*?)(;)$/

// "  .texto {" / "  h2 {"
const RE_CSS_SELECTOR = /^(\s*)([^{]+?)(\s*\{)$/

// "  }"
const RE_CSS_CIERRE = /^(\s*)(\})(\s*)$/

/**
 * @param {string} etiqueta
 * @returns {import('../types.js').Token[]}
 */
function tokenizarEtiqueta(etiqueta) {
  /** @type {import('../types.js').Token[]} */
  const tokens = []
  let ultimo = 0

  for (const parte of etiqueta.matchAll(RE_PARTES)) {
    const inicio = parte.index
    // separadores entre partes (espacios)
    tokens.push({ tipo: 'puntuacion', texto: etiqueta.slice(ultimo, inicio) })

    if (parte[1]) {
      // "<article" / "</h2": separamos el símbolo del nombre
      const prefijo = parte[0].startsWith('</') ? '</' : '<'
      tokens.push({ tipo: 'puntuacion', texto: prefijo })
      tokens.push({ tipo: 'etiqueta', texto: parte[1] })
    } else if (parte[2]) {
      tokens.push({ tipo: 'atributo', texto: parte[2] })
      tokens.push({ tipo: 'puntuacion', texto: '=' })
      tokens.push({ tipo: 'puntuacion', texto: parte[3] })
      tokens.push({ tipo: 'valor-html', texto: parte[4] })
      tokens.push({ tipo: 'puntuacion', texto: parte[3] })
    } else {
      // cierre: ">" o "/>"
      tokens.push({ tipo: 'puntuacion', texto: parte[0] })
    }

    ultimo = inicio + parte[0].length
  }

  tokens.push({ tipo: 'puntuacion', texto: etiqueta.slice(ultimo) })
  return tokens
}

/**
 * @param {string} linea
 * @returns {import('../types.js').Token[]}
 */
function tokenizarHtml(linea) {
  /** @type {import('../types.js').Token[]} */
  const tokens = []
  let ultimo = 0

  for (const etiqueta of linea.matchAll(RE_ETIQUETA)) {
    const inicio = etiqueta.index
    // contenido de texto antes de la etiqueta (título, párrafos...)
    tokens.push({ tipo: 'texto', texto: linea.slice(ultimo, inicio) })
    tokens.push(...tokenizarEtiqueta(etiqueta[0]))
    ultimo = inicio + etiqueta[0].length
  }

  tokens.push({ tipo: 'texto', texto: linea.slice(ultimo) })
  return tokens
}

/**
 * @param {string} linea
 * @returns {import('../types.js').Token[]}
 */
function tokenizarCss(linea) {
  const propiedad = linea.match(RE_CSS_PROPIEDAD)
  if (propiedad) {
    return [
      { tipo: 'texto', texto: propiedad[1] },
      { tipo: 'propiedad', texto: propiedad[2] },
      { tipo: 'puntuacion', texto: propiedad[3] },
      { tipo: 'valor-css', texto: propiedad[4] },
      { tipo: 'puntuacion', texto: propiedad[5] },
    ]
  }

  const selector = linea.match(RE_CSS_SELECTOR)
  if (selector) {
    return [
      { tipo: 'texto', texto: selector[1] },
      { tipo: 'selector', texto: selector[2] },
      { tipo: 'puntuacion', texto: selector[3] },
    ]
  }

  const cierre = linea.match(RE_CSS_CIERRE)
  if (cierre) {
    return [
      { tipo: 'texto', texto: cierre[1] },
      { tipo: 'puntuacion', texto: cierre[2] },
      { tipo: 'texto', texto: cierre[3] },
    ]
  }

  // línea vacía o algo que no reconocemos: se muestra tal cual
  return [{ tipo: 'texto', texto: linea }]
}

/**
 * Divide el snippet en líneas de tokens listos para pintar.
 *
 * @param {string} codigo
 * @returns {import('../types.js').Token[][]}
 */
export function resaltarCodigo(codigo) {
  /** @type {import('../types.js').Token[][]} */
  const lineas = []
  let enEstilo = false

  for (const linea of codigo.split('\n')) {
    const recortada = linea.trim()

    if (recortada === '<style>') {
      enEstilo = true
      lineas.push(tokenizarHtml(linea))
      continue
    }

    if (recortada === '</style>') {
      enEstilo = false
      lineas.push(tokenizarHtml(linea))
      continue
    }

    lineas.push(enEstilo ? tokenizarCss(linea) : tokenizarHtml(linea))
  }

  return lineas
}
