import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { CLAVE_PRESETS, sanearObjeto } from './persistencia.js'

// tope defensivo: un storage manipulado no puede inflar la UI sin límite
export const MAX_PRESETS = 50

/**
 * Sanea una entrada desconocida a PresetPropio, o null si no es válida.
 *
 * @param {unknown} entrada
 * @returns {import('../types.js').PresetPropio | null}
 */
function sanearPreset(entrada) {
  if (typeof entrada !== 'object' || entrada === null) return null

  const objeto = /** @type {Record<string, unknown>} */ (entrada)
  if (typeof objeto.nombre !== 'string') return null

  const nombre = objeto.nombre.trim()
  if (!nombre) return null

  return {
    nombre,
    estilos: /** @type {import('../types.js').Estilos} */ (
      sanearObjeto(objeto.estilos, ESTILOS_POR_DEFECTO)
    ),
  }
}

/**
 * @param {unknown} guardado
 * @returns {import('../types.js').PresetPropio[]}
 */
function sanearLista(guardado) {
  if (!Array.isArray(guardado)) return []

  /** @type {import('../types.js').PresetPropio[]} */
  const lista = []
  for (const entrada of guardado) {
    const preset = sanearPreset(entrada)
    if (preset) lista.push(preset)
  }

  return lista.slice(-MAX_PRESETS)
}

/**
 * Lee los temas propios guardados en este navegador. Nunca lanza: JSON roto,
 * storage bloqueado o entradas con forma inválida caen a una lista vacía.
 *
 * @returns {import('../types.js').PresetPropio[]}
 */
export function cargarPresets() {
  try {
    const crudo = localStorage.getItem(CLAVE_PRESETS)
    if (!crudo) return []

    return sanearLista(JSON.parse(crudo))
  } catch {
    return []
  }
}

/**
 * @param {import('../types.js').PresetPropio[]} presets
 */
export function guardarPresets(presets) {
  try {
    localStorage.setItem(CLAVE_PRESETS, JSON.stringify(presets))
  } catch {
    // sin persistencia, pero la sesión sigue funcionando
  }
}

/**
 * Agrega o reemplaza (mismo nombre, sin distinguir mayúsculas) y devuelve una
 * lista nueva. No muta la recibida y copia los estilos: el tema guardado no
 * cambia si el usuario sigue editando.
 *
 * @param {import('../types.js').PresetPropio[]} presets
 * @param {string} nombre
 * @param {import('../types.js').Estilos} estilos
 * @returns {import('../types.js').PresetPropio[]}
 */
export function agregarPreset(presets, nombre, estilos) {
  const limpio = nombre.trim()
  if (!limpio) return presets

  const sinRepetido = presets.filter(
    (preset) => preset.nombre.toLowerCase() !== limpio.toLowerCase(),
  )

  return [...sinRepetido, { nombre: limpio, estilos: { ...estilos } }].slice(
    -MAX_PRESETS,
  )
}

/**
 * @param {import('../types.js').PresetPropio[]} presets
 * @param {string} nombre
 * @returns {import('../types.js').PresetPropio[]}
 */
export function quitarPreset(presets, nombre) {
  return presets.filter((preset) => preset.nombre !== nombre)
}
