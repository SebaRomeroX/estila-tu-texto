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
    },
  },
]
