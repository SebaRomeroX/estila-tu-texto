import { ESTILOS_POR_DEFECTO } from './estilos'
import { CLAVE_PRESETS, sanearObjeto } from './persistencia'
import type { Estilos, PresetPropio } from '../types'

// tope defensivo: un storage manipulado no puede inflar la UI sin límite
export const MAX_PRESETS = 50

/**
 * Sanea una entrada desconocida a PresetPropio, o null si no es válida.
 */
function sanearPreset(entrada: unknown): PresetPropio | null {
  if (typeof entrada !== 'object' || entrada === null) return null

  const objeto = entrada as Record<string, unknown>
  if (typeof objeto.nombre !== 'string') return null

  const nombre = objeto.nombre.trim()
  if (!nombre) return null

  return {
    nombre,
    estilos: sanearObjeto(objeto.estilos, ESTILOS_POR_DEFECTO),
  }
}

function sanearLista(guardado: unknown): PresetPropio[] {
  if (!Array.isArray(guardado)) return []

  const lista: PresetPropio[] = []
  for (const entrada of guardado) {
    const preset = sanearPreset(entrada)
    if (preset) lista.push(preset)
  }

  return lista.slice(-MAX_PRESETS)
}

/**
 * Lee los temas propios guardados en este navegador. Nunca lanza: JSON roto,
 * storage bloqueado o entradas con forma inválida caen a una lista vacía.
 */
export function cargarPresets(): PresetPropio[] {
  try {
    const crudo = localStorage.getItem(CLAVE_PRESETS)
    if (!crudo) return []

    return sanearLista(JSON.parse(crudo))
  } catch {
    return []
  }
}

export function guardarPresets(presets: PresetPropio[]): void {
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
 */
export function agregarPreset(
  presets: PresetPropio[],
  nombre: string,
  estilos: Estilos,
): PresetPropio[] {
  const limpio = nombre.trim()
  if (!limpio) return presets

  const sinRepetido = presets.filter(
    (preset) => preset.nombre.toLowerCase() !== limpio.toLowerCase(),
  )

  return [...sinRepetido, { nombre: limpio, estilos: { ...estilos } }].slice(
    -MAX_PRESETS,
  )
}

export function quitarPreset(
  presets: PresetPropio[],
  nombre: string,
): PresetPropio[] {
  return presets.filter((preset) => preset.nombre !== nombre)
}
