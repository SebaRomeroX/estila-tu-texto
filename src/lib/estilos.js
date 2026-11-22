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
  ancho: '65',
  transform: 'none',
  decoracion: 'none',
  estiloLetra: 'normal',
  escalaTitulo: '150',
  sangria: '0',
  espacioPalabras: '0',
  versalitas: 'none',
  corteLinea: 'wrap',
  letraCapitular: 'none',
  sombra: 'none',
})

/**
 * Factor de la escala del título (150 -> 1.5). Si el valor guardado no es un
 * número positivo (storage o enlace editado a mano), cae al 1.5 por defecto:
 * el CSS generado nunca queda inválido.
 *
 * @param {string} escalaTitulo
 * @returns {number}
 */
export function factorTitulo(escalaTitulo) {
  const escala = Number(escalaTitulo)
  return Number.isFinite(escala) && escala > 0 ? escala / 100 : 1.5
}

/**
 * Estilo del bloque para el preview: lo mismo que estilosToStyleObject más la
 * variable CSS de la escala del título. Va aparte porque es una variable, no
 * una propiedad del bloque, y no debe terminar en el snippet generado.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {import('react').CSSProperties}
 */
export function estilosToPreviewStyle(estilos) {
  return /** @type {import('react').CSSProperties} */ ({
    ...estilosToStyleObject(estilos),
    '--escala-titulo': String(factorTitulo(estilos.escalaTitulo)),
    '--sangria': `${estilos.sangria}em`,
  })
}

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
    ancho,
    transform,
    decoracion,
    estiloLetra,
    espacioPalabras,
    versalitas,
    corteLinea,
    sombra,
  } = estilos

  return {
    color,
    background,
    fontFamily: family,
    fontSize: `${size}em`,
    fontWeight: weight,
    // valores libres del dominio (vienen de selects); en CSS son uniones
    fontStyle: /** @type {import('react').CSSProperties['fontStyle']} */ (
      estiloLetra
    ),
    fontVariant: /** @type {import('react').CSSProperties['fontVariant']} */ (
      versalitas
    ),
    letterSpacing: `${spacing}em`,
    wordSpacing: `${espacioPalabras}em`,
    // sin unidad: se multiplica por el tamaño de fuente del contexto y no se
    // acumula con la herencia (con "em" un 1.4 dentro de otro 1.4 da 1.96)
    lineHeight: height,
    gap: `${gap}em`,
    // medida de lectura: en "ch" (ancho del carácter 0) se adapta a la fuente
    maxWidth: `${ancho}ch`,
    // el dominio guarda string libre (viene de inputs); en CSS es una unión
    textAlign: /** @type {import('react').CSSProperties['textAlign']} */ (
      align
    ),
    textTransform:
      /** @type {import('react').CSSProperties['textTransform']} */ (transform),
    textDecoration:
      /** @type {import('react').CSSProperties['textDecoration']} */ (
        decoracion
      ),
    // text-wrap llega como string libre del select; en CSS es una unión
    textWrap: /** @type {import('react').CSSProperties['textWrap']} */ (
      corteLinea
    ),
    // sombra apagada = no se emite la propiedad: el CSS por defecto queda
    // intacto. Es heredable, así que cubre título, subtítulo y párrafos.
    ...(sombra === 'none'
      ? {}
      : {
          textShadow:
            sombra === 'suave'
              ? '0 1px 2px rgba(0, 0, 0, 0.45)'
              : '0 0 0.4em currentColor',
        }),
  }
}
