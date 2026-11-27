import { ESTILOS_POR_DEFECTO } from './estilos'
import type { CampoEstilo, Estilos, Preset } from '../types'

/**
 * Temas predefinidos: combinaciones curadas de estilos. "Clásico" replica los
 * valores por defecto de la app; los demás exploran combinaciones distintas.
 * Todos los valores respetan los rangos de InputsParams (el editor los muestra
 * coherentes al aplicar un tema).
 */
export const PRESETS: Preset[] = [
  {
    id: 'clasico',
    nombre: 'Clásico',
    estilos: { ...ESTILOS_POR_DEFECTO },
  },
  {
    id: 'editorial',
    nombre: 'Editorial',
    estilos: {
      ...ESTILOS_POR_DEFECTO,
      color: '#222222',
      background: '#F7F3EC',
      family: 'Georgia, serif',
      size: '1.3',
      spacing: '0.01',
      height: '1.6',
      gap: '1.2',
      ancho: '65',
      escalaTitulo: '150',
    },
  },
  {
    id: 'consola',
    nombre: 'Consola',
    estilos: {
      ...ESTILOS_POR_DEFECTO,
      color: '#79E08B',
      background: '#0A0F0A',
      family: 'Courier New, Courier, monospace',
      size: '1.1',
      spacing: '0.08',
      height: '1.5',
      gap: '0.8',
      ancho: '80',
      escalaTitulo: '140',
    },
  },
  {
    id: 'impacto',
    nombre: 'Impacto',
    estilos: {
      ...ESTILOS_POR_DEFECTO,
      color: '#FFFFFF',
      background: '#111111',
      family: 'Arial, Helvetica, sans-serif',
      size: '1.6',
      weight: '600',
      spacing: '0.02',
      height: '1.3',
      align: 'center',
      ancho: '50',
      transform: 'uppercase',
      escalaTitulo: '180',
    },
  },
]

// claves del dominio, tipadas: indexar Estilos con un string suelto sería un
// error de tipos
const CAMPOS = Object.keys(ESTILOS_POR_DEFECTO) as CampoEstilo[]

/**
 * ¿Dos bloques de estilos son idénticos en TODAS las claves del dominio?
 */
export function esMismoEstilo(a: Estilos, b: Estilos): boolean {
  return CAMPOS.every((campo) => a[campo] === b[campo])
}

/**
 * Devuelve el id del preset cuyos valores coinciden EXACTAMENTE con los
 * estilos actuales, o null si el usuario editó algo a mano (ya no es un tema).
 */
export function presetActivo(estilos: Estilos): string | null {
  const preset = PRESETS.find(({ estilos: candidato }) =>
    esMismoEstilo(estilos, candidato),
  )

  return preset ? preset.id : null
}
