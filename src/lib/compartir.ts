import { ESTILOS_POR_DEFECTO } from './estilos'
import { sanearObjeto } from './persistencia'
import { TEXTO_POR_DEFECTO } from './texto'
import type { EstadoCompartido, Estilos, Texto } from '../types'

// Versión del formato del enlace: si cambia la forma del estado, los enlaces
// viejos se ignoran en vez de aplicarse mal.
const VERSION = 1

/**
 * base64url (sin +, / ni relleno) de un string UTF-8: seguro dentro del hash.
 */
function aBase64Url(texto: string): string {
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
 */
function deBase64Url(codificado: string): string {
  const base64 = codificado.replaceAll('-', '+').replaceAll('_', '/')
  const relleno = base64.length % 4
  const conRelleno = relleno ? base64 + '='.repeat(4 - relleno) : base64
  const binario = atob(conRelleno)
  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

/**
 * Serializa texto + estilos para meterlos en el hash de la URL.
 */
export function codificarEstado(texto: Texto, estilos: Estilos): string {
  return aBase64Url(JSON.stringify({ v: VERSION, texto, estilos }))
}

/**
 * Lee el estado de un hash (#s=...). Devuelve null si no hay enlace, si el
 * base64 o el JSON están rotos, si la versión no coincide o si el contenido
 * no es un objeto. El estado se sanea con los defaults: un enlace manipulado
 * no puede meter claves ni tipos que la app no conozca.
 */
export function decodificarEstado(hash: string): EstadoCompartido | null {
  try {
    const parametros = new URLSearchParams(String(hash).replace(/^#/, ''))
    const codificado = parametros.get('s')
    if (!codificado) return null

    const datos: unknown = JSON.parse(deBase64Url(codificado))
    if (typeof datos !== 'object' || datos === null) return null

    const objeto = datos as Record<string, unknown>
    if (objeto.v !== VERSION) return null

    return {
      texto: sanearObjeto(objeto.texto, TEXTO_POR_DEFECTO),
      estilos: sanearObjeto(objeto.estilos, ESTILOS_POR_DEFECTO),
    }
  } catch {
    // base64 roto, JSON inválido o hash ausente
    return null
  }
}

/**
 * Arma la URL completa para compartir. No modifica la ubicación actual: el
 * enlace se copia sin ensuciar el historial ni pisar ediciones al recargar.
 */
export function crearEnlace(
  texto: Texto,
  estilos: Estilos,
  base: string,
): string {
  const url = new URL(base)
  url.hash = `s=${codificarEstado(texto, estilos)}`

  return url.toString()
}

/**
 * Si la URL actual trae un estado compartido válido, lo quita del hash: el
 * enlace se aplica una vez y a partir de ahí manda la persistencia normal.
 * Un ancla cualquiera (#seccion) se respeta.
 */
export function limpiarHashCompartido(): void {
  if (decodificarEstado(window.location.hash) === null) return

  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}
