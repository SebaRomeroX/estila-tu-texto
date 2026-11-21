import { ESTILOS_POR_DEFECTO } from './estilos.js'

/**
 * Temas predefinidos: combinaciones curadas de estilos. "Clásico" replica los
 * valores por defecto de la app; los demás exploran combinaciones distintas.
 * Todos los valores respetan los rangos de InputsParams (el editor los muestra
 * coherentes al aplicar un tema).
 *
 * @type {import('../types.js').Preset[]}
 */
export const PRESETS = [
  {
    id: 'clasico',
    nombre: 'Clásico',
    estilos: { ...ESTILOS_POR_DEFECTO },
  },
  {
    id: 'editorial',
    nombre: 'Editorial',
    estilos: {
      color: '#222222',
      background: '#F7F3EC',
      family: 'Georgia, serif',
      size: '1.3',
      weight: '400',
      spacing: '0.01',
      height: '1.6',
      gap: '1.2',
      align: 'left',
      ancho: '65',
      transform: 'none',
      decoracion: 'none',
      estiloLetra: 'normal',
      escalaTitulo: '150',
    },
  },
  {
    id: 'consola',
    nombre: 'Consola',
    estilos: {
      color: '#79E08B',
      background: '#0A0F0A',
      family: 'Courier New, Courier, monospace',
      size: '1.1',
      weight: '400',
      spacing: '0.08',
      height: '1.5',
      gap: '0.8',
      align: 'left',
      ancho: '80',
      transform: 'none',
      decoracion: 'none',
      estiloLetra: 'normal',
      escalaTitulo: '140',
    },
  },
  {
    id: 'impacto',
    nombre: 'Impacto',
    estilos: {
      color: '#FFFFFF',
      background: '#111111',
      family: 'Arial, Helvetica, sans-serif',
      size: '1.6',
      weight: '600',
      spacing: '0.02',
      height: '1.3',
      gap: '1',
      align: 'center',
      ancho: '50',
      transform: 'uppercase',
      decoracion: 'none',
      estiloLetra: 'normal',
      escalaTitulo: '180',
    },
  },
]

// claves del dominio, tipadas: indexar Estilos con un string suelto sería un
// error de tipos (noImplicitAny)
const CAMPOS = /** @type {Array<keyof import('../types.js').Estilos>} */ (
  Object.keys(ESTILOS_POR_DEFECTO)
)

/**
 * ¿Dos bloques de estilos son idénticos en TODAS las claves del dominio?
 *
 * @param {import('../types.js').Estilos} a
 * @param {import('../types.js').Estilos} b
 * @returns {boolean}
 */
export function esMismoEstilo(a, b) {
  return CAMPOS.every((campo) => a[campo] === b[campo])
}

/**
 * Devuelve el id del preset cuyos valores coinciden EXACTAMENTE con los
 * estilos actuales, o null si el usuario editó algo a mano (ya no es un tema).
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string | null}
 */
export function presetActivo(estilos) {
  const preset = PRESETS.find(({ estilos: candidato }) =>
    esMismoEstilo(estilos, candidato),
  )

  return preset ? preset.id : null
}
