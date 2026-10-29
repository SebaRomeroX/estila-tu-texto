// Fuente ÚNICA de la traducción estilos -> propiedades CSS con unidades.
// Tanto el preview (Visualizador) como el código generado (generateCode)
// leen de aquí: cambiar una unidad o agregar una propiedad en un solo lugar
// garantiza que nunca diverjan.
export function estilosToStyleObject (estilos) {
  const { color, background, family, size, weight, spacing, height, gap, align } = estilos

  return {
    color,
    background,
    fontFamily: family,
    fontSize: `${size}em`,
    fontWeight: weight,
    letterSpacing: `${spacing}em`,
    lineHeight: `${height}em`,
    gap: `${gap}em`,
    textAlign: align,
  }
}
