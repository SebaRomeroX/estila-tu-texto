/**
 * Valores por defecto de la tipografía. Fuente única: los usa el provider
 * (estado inicial), los presets ("Clásico") y la persistencia (fallback).
 */
export const ESTILOS_POR_DEFECTO = Object.freeze({
  color: '#F0F8FF',
  background: '#020202',
  family: 'system-ui',
  size: '1.2',
  weight: '400',
  spacing: '0.04',
  height: '1.4',
  gap: '1',
  align: 'left',
})

/**
 * Fuente ÚNICA de la traducción estilos -> propiedades CSS con unidades.
 * Tanto el preview (Visualizador) como el código generado (generateCode)
 * leen de aquí: cambiar una unidad o agregar una propiedad en un solo lugar
 * garantiza que nunca diverjan.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {import('react').CSSProperties}
 */
export function estilosToStyleObject(estilos) {
  const {
    color,
    background,
    family,
    size,
    weight,
    spacing,
    height,
    gap,
    align,
  } = estilos

  return {
    color,
    background,
    fontFamily: family,
    fontSize: `${size}em`,
    fontWeight: weight,
    letterSpacing: `${spacing}em`,
    lineHeight: `${height}em`,
    gap: `${gap}em`,
    // el dominio guarda string libre (viene de inputs); en CSS es una unión
    textAlign: /** @type {import('react').CSSProperties['textAlign']} */ (
      align
    ),
  }
}
