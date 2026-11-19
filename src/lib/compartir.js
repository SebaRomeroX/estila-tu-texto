import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { sanearObjeto } from './persistencia.js'
import { TEXTO_POR_DEFECTO } from './texto.js'

// Versión del formato del enlace: si cambia la forma del estado, los enlaces
// viejos se ignoran en vez de aplicarse mal.
const VERSION = 1

/**
 * base64url (sin +, / ni relleno) de un string UTF-8: seguro dentro del hash.
 *
 * @param {string} texto
 * @returns {string}
 */
function aBase64Url(texto) {
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)

  return btoa(binario)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

/**
 * Inverso de aBase64Url, tolerante al relleno que falte.
 *
 * @param {string} codificado
 * @returns {string}
 */
function deBase64Url(codificado) {
  const base64 = codificado.replaceAll('-', '+').replaceAll('_', '/')
  const relleno = base64.length % 4
  const conRelleno = relleno ? base64 + '='.repeat(4 - relleno) : base64
  const binario = atob(conRelleno)
  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

/**
 * Serializa texto + estilos para meterlos en el hash de la URL.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function codificarEstado(texto, estilos) {
  return aBase64Url(JSON.stringify({ v: VERSION, texto, estilos }))
}

/**
 * Lee el estado de un hash (#s=...). Devuelve null si no hay enlace, si el
 * base64 o el JSON están rotos, si la versión no coincide o si el contenido
 * no es un objeto. El estado se sanea con los defaults: un enlace manipulado
 * no puede meter claves ni tipos que la app no conozca.
 *
 * @param {string} hash
 * @returns {{ texto: import('../types.js').Texto, estilos: import('../types.js').Estilos } | null}
 */
export function decodificarEstado(hash) {
  try {
    const parametros = new URLSearchParams(String(hash).replace(/^#/, ''))
    const codificado = parametros.get('s')
    if (!codificado) return null

    const datos = JSON.parse(deBase64Url(codificado))
    if (typeof datos !== 'object' || datos === null || datos.v !== VERSION) {
      return null
    }

    return {
      texto: /** @type {import('../types.js').Texto} */ (
        sanearObjeto(datos.texto, TEXTO_POR_DEFECTO)
      ),
      estilos: /** @type {import('../types.js').Estilos} */ (
        sanearObjeto(datos.estilos, ESTILOS_POR_DEFECTO)
      ),
    }
  } catch {
    // base64 roto, JSON inválido o hash ausente
    return null
  }
}

/**
 * Arma la URL completa para compartir. No modifica la ubicación actual: el
 * enlace se copia sin ensuciar el historial ni pisar ediciones al recargar.
 *
 * @param {import('../types.js').Texto} texto
 * @param {import('../types.js').Estilos} estilos
 * @param {string} base
 * @returns {string}
 */
export function crearEnlace(texto, estilos, base) {
  const url = new URL(base)
  url.hash = `s=${codificarEstado(texto, estilos)}`

  return url.toString()
}

/**
 * Si la URL actual trae un estado compartido válido, lo quita del hash: el
 * enlace se aplica una vez y a partir de ahí manda la persistencia normal.
 * Un ancla cualquiera (#seccion) se respeta.
 */
export function limpiarHashCompartido() {
  if (decodificarEstado(window.location.hash) === null) return

  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}
