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
  sombraX: '0',
  sombraY: '2',
  sombraDifuminado: '4',
  sombraColor: '#000000',
  seleccion: 'none',
  seleccionFondo: '#2F4F6F',
  seleccionTexto: '#FFFFFF',
  // "heredar" y "" significan que el título sigue al cuerpo / al color
  // heredado: con los defaults no se emite ninguna propiedad nueva
  tituloFamilia: 'heredar',
  tituloPeso: 'heredar',
  tituloColor: '',
  // el subtítulo parte de lo que el navegador le da a un h3 (1.17em y bold);
  // con estos defaults no se emite ninguna regla nueva en el snippet
  subtituloFamilia: 'heredar',
  subtituloPeso: 'heredar',
  subtituloColor: '',
  escalaSubtitulo: '117',
  degradado: 'none',
  degradadoInicio: '#F0F8FF',
  degradadoFin: '#2D5AAD',
  columnas: 'una',
  opacidad: '1',
  borde: 'none',
  bordeAncho: '2',
  bordeColor: '#F0F8FF',
  bordeRadio: '12',
  contorno: 'none',
  contornoAncho: '1',
  contornoColor: '#000000',
  animacion: 'none',
  glass: 'none',
  paddingVertical: '30',
  paddingHorizontal: '60',
  fondoTransparente: 'no',
})

/**
 * Factor de una escala porcentual (150 -> 1.5). Si el valor guardado no es un
 * número positivo (storage o enlace editado a mano), cae al valor por defecto:
 * el CSS generado nunca queda inválido.
 *
 * @param {string} escala
 * @param {number} porDefecto
 * @returns {number}
 */
function factorEscala(escala, porDefecto) {
  const numero = Number(escala)
  return Number.isFinite(numero) && numero > 0 ? numero / 100 : porDefecto
}

/**
 * @param {string} escalaTitulo
 * @returns {number}
 */
export function factorTitulo(escalaTitulo) {
  return factorEscala(escalaTitulo, 1.5)
}

/**
 * El h3 del navegador mide 1.17em; ese es el valor de partida.
 *
 * @param {string} escalaSubtitulo
 * @returns {number}
 */
export function factorSubtitulo(escalaSubtitulo) {
  return factorEscala(escalaSubtitulo, 1.17)
}

/**
 * Gradiente de texto compartido por preview y snippet. El ángulo es fijo:
 * el usuario elige los dos colores, no la dirección.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function degradadoCss(estilos) {
  return `linear-gradient(135deg, ${estilos.degradadoInicio}, ${estilos.degradadoFin})`
}

/**
 * Convierte un color hexadecimal (#RGB o #RRGGBB) a rgba con la transparencia
 * pedida. Si el valor no es un hex válido se devuelve tal cual: el CSS nunca
 * queda inválido, simplemente conserva el color original.
 *
 * @param {string} color
 * @param {number} alfa 0–1
 * @returns {string}
 */
export function colorConAlfa(color, alfa) {
  const coincidencia = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (!coincidencia) return color

  const valor = coincidencia[1]
  const completo =
    valor.length === 3
      ? valor
          .split('')
          .map((caracter) => caracter + caracter)
          .join('')
      : valor
  const rojo = Number.parseInt(completo.slice(0, 2), 16)
  const verde = Number.parseInt(completo.slice(2, 4), 16)
  const azul = Number.parseInt(completo.slice(4, 6), 16)

  return `rgba(${rojo}, ${verde}, ${azul}, ${alfa})`
}

/**
 * Padding del bloque en píxeles: vertical horizontal, como el atajo CSS.
 * Vive fuera de estilosToStyleObject porque es parte del layout fijo, pero
 * ahora es configurable; preview y snippet leen de acá para no divergir.
 *
 * @param {import('../types.js').Estilos} estilos
 * @returns {string}
 */
export function paddingBloque(estilos) {
  return `${estilos.paddingVertical}px ${estilos.paddingHorizontal}px`
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
    padding: paddingBloque(estilos),
    '--escala-titulo': String(factorTitulo(estilos.escalaTitulo)),
    '--escala-subtitulo': String(factorSubtitulo(estilos.escalaSubtitulo)),
    '--sangria': `${estilos.sangria}em`,
    '--seleccion-fondo': estilos.seleccionFondo,
    '--seleccion-texto': estilos.seleccionTexto,
    // el gradiente se pasa como variable para que la regla del preview y la
    // del snippet compartan exactamente los mismos colores
    ...(estilos.degradado === 'degradado'
      ? { '--degradado': degradadoCss(estilos) }
      : {}),
    // solo se emiten las variables del título cuando el usuario las cambió:
    // con los defaults el preview sigue usando la herencia y el bold del UA
    ...(estilos.tituloFamilia === 'heredar'
      ? {}
      : { '--titulo-familia': estilos.tituloFamilia }),
    ...(estilos.tituloPeso === 'heredar'
      ? {}
      : { '--titulo-peso': estilos.tituloPeso }),
    ...(estilos.tituloColor === ''
      ? {}
      : { '--titulo-color': estilos.tituloColor }),
    // ídem para el subtítulo
    ...(estilos.subtituloFamilia === 'heredar'
      ? {}
      : { '--subtitulo-familia': estilos.subtituloFamilia }),
    ...(estilos.subtituloPeso === 'heredar'
      ? {}
      : { '--subtitulo-peso': estilos.subtituloPeso }),
    ...(estilos.subtituloColor === ''
      ? {}
      : { '--subtitulo-color': estilos.subtituloColor }),
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
    fondoTransparente,
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
    sombraX,
    sombraY,
    sombraDifuminado,
    sombraColor,
    opacidad,
    borde,
    bordeAncho,
    bordeColor,
    bordeRadio,
    contorno,
    contornoAncho,
    contornoColor,
    glass,
  } = estilos

  // fondo efectivo: transparente gana; glass usa el mismo color con alfa para
  // que el desenfoque de atrás se vea. El resto conserva el color sólido.
  const fondo =
    fondoTransparente === 'si'
      ? null
      : glass === 'si'
        ? colorConAlfa(background, 0.55)
        : background

  return {
    color,
    // fondo transparente: no se emite la propiedad (ni en el preview ni en el
    // CSS). El color guardado queda como referencia de contraste y para
    // cuando se vuelve al fondo sólido.
    ...(fondo === null ? {} : { background: fondo }),
    fontFamily: family,
    fontSize: `${size}rem`,
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
    // opacidad plena = no se emite la propiedad: el CSS por defecto queda
    // intacto y el snapshot no cambia. Afecta al bloque completo, incluido el
    // fondo, igual en el preview y en el snippet.
    ...(opacidad === '1' ? {} : { opacity: opacidad }),
    // tarjeta glass: desenfoque del fondo más borde y sombra suaves. El fondo
    // translúcido se calculó arriba. Va antes del borde del usuario para que
    // un borde explícito gane si las dos opciones están activas.
    ...(glass === 'si'
      ? {
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.35)',
        }
      : {}),
    // borde del bloque: apagado por defecto, así que no emite propiedades ni
    // cambia el snapshot. El radio se aplica junto con el borde.
    ...(borde === 'si'
      ? {
          border: `${bordeAncho}px solid ${bordeColor}`,
          borderRadius: `${bordeRadio}px`,
        }
      : {}),
    // contorno del texto: apagado por defecto y sin emitir nada. El
    // paint-order deja el relleno por encima del trazo para no taparlo.
    ...(contorno === 'si'
      ? {
          WebkitTextStroke: `${contornoAncho}px ${contornoColor}`,
          paintOrder: 'stroke fill',
        }
      : {}),
    // sombra apagada = no se emite la propiedad: el CSS por defecto queda
    // intacto. Es heredable, así que cubre título, subtítulo y párrafos.
    ...(sombra === 'none'
      ? {}
      : {
          textShadow:
            sombra === 'suave'
              ? '0 1px 2px rgba(0, 0, 0, 0.45)'
              : sombra === 'resplandor'
                ? '0 0 0.4em currentColor'
                : `${sombraX}px ${sombraY}px ${sombraDifuminado}px ${sombraColor}`,
        }),
  }
}
