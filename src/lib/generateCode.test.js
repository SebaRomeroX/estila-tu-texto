import { describe, expect, it } from 'vitest'
import {
  escapeHtml,
  generateCode,
  generateCss,
  generateDocumento,
  generateHtml,
} from './generateCode.js'
import {
  colorConAlfa,
  degradadoCss,
  estilosToPreviewStyle,
  estilosToStyleObject,
  factorSubtitulo,
  factorTitulo,
} from './estilos.js'

const ESTILOS = {
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
  tituloFamilia: 'heredar',
  tituloPeso: 'heredar',
  tituloColor: '',
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
}

const TEXTO = {
  titulo: 'Titulo de prueba',
  parrafo1: 'Parrafo uno',
  parrafo2: 'Parrafo dos',
  subtitulo: 'Subtitulo',
  parrafo3: 'Parrafo tres',
}

describe('escapeHtml', () => {
  it('escapa los 5 caracteres peligrosos', () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    )
  })

  it('escapa & primero para no doble-escapar lo ya escapado', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('&amp;')).toBe('&amp;amp;')
  })

  it('convierte valores no string sin explotar', () => {
    expect(escapeHtml(42)).toBe('42')
  })
})

describe('estilosToStyleObject', () => {
  it('aplica las unidades correspondientes a cada propiedad', () => {
    expect(estilosToStyleObject(ESTILOS)).toEqual({
      color: '#F0F8FF',
      background: '#020202',
      fontFamily: 'system-ui',
      fontSize: '1.2rem',
      fontWeight: '400',
      fontStyle: 'normal',
      fontVariant: 'none',
      letterSpacing: '0.04em',
      wordSpacing: '0em',
      // line-height va sin unidad: no se acumula con la herencia
      lineHeight: '1.4',
      gap: '1em',
      maxWidth: '65ch',
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      textWrap: 'wrap',
    })
  })

  it('refleja cambios de estado en el objeto de estilo', () => {
    const estilo = estilosToStyleObject({ ...ESTILOS, size: '2' })
    expect(estilo.fontSize).toBe('2rem')
  })

  it('el ancho de línea sale en ch para adaptarse a la fuente', () => {
    expect(estilosToStyleObject({ ...ESTILOS, ancho: '45' }).maxWidth).toBe(
      '45ch',
    )
  })

  it('traduce mayúsculas, decoración y cursiva', () => {
    const estilo = estilosToStyleObject({
      ...ESTILOS,
      transform: 'uppercase',
      decoracion: 'underline',
      estiloLetra: 'italic',
    })

    expect(estilo.textTransform).toBe('uppercase')
    expect(estilo.textDecoration).toBe('underline')
    expect(estilo.fontStyle).toBe('italic')
  })

  it('traduce espacio entre palabras, versalitas y corte de línea', () => {
    const estilo = estilosToStyleObject({
      ...ESTILOS,
      espacioPalabras: '0.2',
      versalitas: 'small-caps',
      corteLinea: 'balance',
    })

    expect(estilo.wordSpacing).toBe('0.2em')
    expect(estilo.fontVariant).toBe('small-caps')
    expect(estilo.textWrap).toBe('balance')
  })

  it('acepta letter-spacing negativo', () => {
    expect(
      estilosToStyleObject({ ...ESTILOS, spacing: '-0.05' }).letterSpacing,
    ).toBe('-0.05em')
  })

  it('solo agrega opacidad cuando el bloque no es opaco', () => {
    expect(estilosToStyleObject(ESTILOS)).not.toHaveProperty('opacity')

    expect(estilosToStyleObject({ ...ESTILOS, opacidad: '0.6' }).opacity).toBe(
      '0.6',
    )
  })

  it('solo agrega borde y radio cuando el borde está activo', () => {
    expect(estilosToStyleObject(ESTILOS)).not.toHaveProperty('border')

    const conBorde = estilosToStyleObject({
      ...ESTILOS,
      borde: 'si',
      bordeAncho: '3',
      bordeColor: '#123456',
      bordeRadio: '20',
    })
    expect(conBorde.border).toBe('3px solid #123456')
    expect(conBorde.borderRadius).toBe('20px')
  })

  it('solo agrega el contorno cuando está activo', () => {
    expect(estilosToStyleObject(ESTILOS)).not.toHaveProperty('WebkitTextStroke')

    const conContorno = estilosToStyleObject({
      ...ESTILOS,
      contorno: 'si',
      contornoAncho: '2',
      contornoColor: '#123456',
    })
    expect(conContorno.WebkitTextStroke).toBe('2px #123456')
    expect(conContorno.paintOrder).toBe('stroke fill')
  })

  it('aplica la tarjeta glass con fondo translúcido y desenfoque', () => {
    const porDefecto = estilosToStyleObject(ESTILOS)
    expect(porDefecto).not.toHaveProperty('backdropFilter')

    const glass = estilosToStyleObject({ ...ESTILOS, glass: 'si' })
    expect(glass.background).toBe('rgba(2, 2, 2, 0.55)')
    expect(glass.backdropFilter).toBe('blur(14px) saturate(140%)')
    expect(glass.WebkitBackdropFilter).toBe('blur(14px) saturate(140%)')
    expect(glass.boxShadow).toContain('rgba(0, 0, 0, 0.35)')
  })

  it('glass respeta el fondo transparente', () => {
    const glass = estilosToStyleObject({
      ...ESTILOS,
      glass: 'si',
      fondoTransparente: 'si',
    })
    expect(glass).not.toHaveProperty('background')
    expect(glass.backdropFilter).toBe('blur(14px) saturate(140%)')
  })

  it('solo agrega text-shadow cuando la sombra está activa', () => {
    expect(estilosToStyleObject(ESTILOS)).not.toHaveProperty('textShadow')

    expect(
      estilosToStyleObject({ ...ESTILOS, sombra: 'suave' }).textShadow,
    ).toBe('0 1px 2px rgba(0, 0, 0, 0.45)')
    expect(
      estilosToStyleObject({ ...ESTILOS, sombra: 'resplandor' }).textShadow,
    ).toBe('0 0 0.4em currentColor')
    expect(
      estilosToStyleObject({
        ...ESTILOS,
        sombra: 'personalizada',
        sombraX: '2',
        sombraY: '4',
        sombraDifuminado: '8',
        sombraColor: '#123456',
      }).textShadow,
    ).toBe('2px 4px 8px #123456')
  })
})

describe('colorConAlfa', () => {
  it('convierte hex de 6 dígitos a rgba', () => {
    expect(colorConAlfa('#020202', 0.55)).toBe('rgba(2, 2, 2, 0.55)')
    expect(colorConAlfa('#F0F8FF', 1)).toBe('rgba(240, 248, 255, 1)')
  })

  it('expande el hex de 3 dígitos', () => {
    expect(colorConAlfa('#abc', 0.5)).toBe('rgba(170, 187, 204, 0.5)')
  })

  it('devuelve el valor original si no es un hex válido', () => {
    expect(colorConAlfa('rgb(1, 2, 3)', 0.5)).toBe('rgb(1, 2, 3)')
  })
})

describe('factorTitulo', () => {
  it('convierte el porcentaje en factor', () => {
    expect(factorTitulo('150')).toBe(1.5)
    expect(factorTitulo('100')).toBe(1)
  })

  it('cae a 1.5 si el valor no es un número positivo', () => {
    expect(factorTitulo('abc')).toBe(1.5)
    expect(factorTitulo('0')).toBe(1.5)
    expect(factorTitulo('-20')).toBe(1.5)
  })
})

describe('factorSubtitulo', () => {
  it('convierte el porcentaje en factor y parte del 1.17 del h3', () => {
    expect(factorSubtitulo('140')).toBe(1.4)
    expect(factorSubtitulo('117')).toBe(1.17)
  })

  it('cae a 1.17 si el valor no es un número positivo', () => {
    expect(factorSubtitulo('abc')).toBe(1.17)
    expect(factorSubtitulo('0')).toBe(1.17)
  })
})

describe('degradadoCss', () => {
  it('arma un gradiente de 135deg con los dos colores elegidos', () => {
    expect(
      degradadoCss({
        ...ESTILOS,
        degradadoInicio: '#000000',
        degradadoFin: '#FFFFFF',
      }),
    ).toBe('linear-gradient(135deg, #000000, #FFFFFF)')
  })
})

describe('estilosToPreviewStyle', () => {
  it('agrega la variable de la escala del título sin tocar el resto', () => {
    const estilo = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({ ...ESTILOS, escalaTitulo: '180' })
    )

    expect(estilo['--escala-titulo']).toBe('1.8')
    expect(estilo.fontSize).toBe('1.2rem')
    expect(estilo).not.toHaveProperty('escalaTitulo')
  })

  it('agrega la variable de la sangría', () => {
    const estilo = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({ ...ESTILOS, sangria: '1.5' })
    )

    expect(estilo['--sangria']).toBe('1.5em')
    // la sangría no va al bloque: indentaría también los títulos
    expect(estilo).not.toHaveProperty('sangria')
    expect(estilo).not.toHaveProperty('textIndent')
  })

  it('agrega las variables de la selección personalizada', () => {
    const estilo = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({
        ...ESTILOS,
        seleccionFondo: '#123456',
        seleccionTexto: '#abcdef',
      })
    )

    expect(estilo['--seleccion-fondo']).toBe('#123456')
    expect(estilo['--seleccion-texto']).toBe('#abcdef')
  })

  it('solo agrega las variables del título cuando se personaliza', () => {
    const porDefecto = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle(ESTILOS)
    )
    expect(porDefecto).not.toHaveProperty('--titulo-familia')
    expect(porDefecto).not.toHaveProperty('--titulo-peso')
    expect(porDefecto).not.toHaveProperty('--titulo-color')

    const propio = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({
        ...ESTILOS,
        tituloFamilia: 'Georgia, serif',
        tituloPeso: '900',
        tituloColor: '#123456',
      })
    )
    expect(propio['--titulo-familia']).toBe('Georgia, serif')
    expect(propio['--titulo-peso']).toBe('900')
    expect(propio['--titulo-color']).toBe('#123456')
  })

  it('solo agrega las variables del subtítulo cuando se personaliza', () => {
    const porDefecto = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle(ESTILOS)
    )
    expect(porDefecto['--escala-subtitulo']).toBe('1.17')
    expect(porDefecto).not.toHaveProperty('--subtitulo-familia')
    expect(porDefecto).not.toHaveProperty('--subtitulo-peso')
    expect(porDefecto).not.toHaveProperty('--subtitulo-color')

    const propio = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({
        ...ESTILOS,
        subtituloFamilia: 'Georgia, serif',
        subtituloPeso: '700',
        subtituloColor: '#123456',
        escalaSubtitulo: '140',
      })
    )
    expect(propio['--escala-subtitulo']).toBe('1.4')
    expect(propio['--subtitulo-familia']).toBe('Georgia, serif')
    expect(propio['--subtitulo-peso']).toBe('700')
    expect(propio['--subtitulo-color']).toBe('#123456')
  })

  it('lleva el padding configurable al preview', () => {
    const porDefecto = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle(ESTILOS)
    )
    expect(porDefecto.padding).toBe('30px 60px')

    const propio = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({
        ...ESTILOS,
        paddingVertical: '50',
        paddingHorizontal: '80',
      })
    )
    expect(propio.padding).toBe('50px 80px')
  })

  it('omite el fondo del preview cuando es transparente', () => {
    const porDefecto = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle(ESTILOS)
    )
    expect(porDefecto.background).toBe('#020202')

    const transparente = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({ ...ESTILOS, fondoTransparente: 'si' })
    )
    expect(transparente).not.toHaveProperty('background')
    // el color de letra no se toca: sigue siendo el del usuario
    expect(transparente.color).toBe('#F0F8FF')
  })

  it('solo agrega la variable del degradado cuando está activo', () => {
    const porDefecto = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle(ESTILOS)
    )
    expect(porDefecto).not.toHaveProperty('--degradado')

    const activo = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({
        ...ESTILOS,
        degradado: 'degradado',
        degradadoInicio: '#000000',
        degradadoFin: '#FFFFFF',
      })
    )
    expect(activo['--degradado']).toBe(
      'linear-gradient(135deg, #000000, #FFFFFF)',
    )
  })
})

describe('generateCode', () => {
  it('genera el snippet con los valores por defecto (snapshot)', () => {
    expect(generateCode(TEXTO, ESTILOS)).toMatchSnapshot()
  })

  it('escapa el texto del usuario en la parte HTML', () => {
    const codigo = generateCode(
      { ...TEXTO, titulo: '<b>hola</b> & chau' },
      ESTILOS,
    )
    expect(codigo).toContain('<h2>&lt;b&gt;hola&lt;/b&gt; &amp; chau</h2>')
    expect(codigo).not.toContain('<b>')
  })

  it('refleja cambios de estilos en el CSS generado', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      size: '2',
      align: 'center',
    })
    expect(codigo).toContain('font-size: 2rem;')
    expect(codigo).toContain('text-align: center;')
    expect(codigo).not.toContain('font-size: 1.2rem;')
  })

  it('genera el layout fijo del bloque', () => {
    const codigo = generateCode(TEXTO, ESTILOS)
    expect(codigo).toContain('display: flex;')
    expect(codigo).toContain('flex-direction: column;')
    expect(codigo).toContain('padding: 30px 60px;')
    expect(codigo).toContain('margin-inline: auto;')
  })

  it('respeta el padding configurable', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      paddingVertical: '50',
      paddingHorizontal: '80',
    })

    expect(codigo).toContain('padding: 50px 80px;')
    expect(codigo).not.toContain('padding: 30px 60px;')
  })

  it('omite el fondo del snippet cuando es transparente', () => {
    expect(generateCode(TEXTO, ESTILOS)).toContain('background: #020202;')

    const transparente = generateCode(TEXTO, {
      ...ESTILOS,
      fondoTransparente: 'si',
    })

    expect(transparente).not.toContain('background: #020202;')
    expect(transparente).not.toContain('background:')
    // el resto del bloque sigue intacto
    expect(transparente).toContain('color: #F0F8FF;')
  })

  it('emite el ancho de línea y el line-height sin unidad', () => {
    const codigo = generateCode(TEXTO, { ...ESTILOS, ancho: '45' })

    expect(codigo).toContain('max-width: 45ch;')
    expect(codigo).toContain('line-height: 1.4;')
    expect(codigo).not.toContain('line-height: 1.4em;')
  })

  it('emite mayúsculas, decoración y cursiva', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      transform: 'capitalize',
      decoracion: 'line-through',
      estiloLetra: 'italic',
    })

    expect(codigo).toContain('text-transform: capitalize;')
    expect(codigo).toContain('text-decoration: line-through;')
    expect(codigo).toContain('font-style: italic;')
  })

  it('emite una regla explícita para el título con la escala elegida', () => {
    const codigo = generateCode(TEXTO, { ...ESTILOS, escalaTitulo: '180' })

    expect(codigo).toContain('.texto h2 {')
    expect(codigo).toContain('font-size: 1.8em;')
  })

  it('emite la sangría solo en párrafos, no en el bloque', () => {
    const codigo = generateCode(TEXTO, { ...ESTILOS, sangria: '1.5' })

    expect(codigo).toContain('.texto p {')
    expect(codigo).toContain('text-indent: 1.5em;')
    // si estuviera en .texto, los títulos también se indentarían
    expect(codigo).not.toContain('  .texto {\n    text-indent')
  })

  it('emite espacio entre palabras, versalitas y corte de línea', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      espacioPalabras: '0.2',
      versalitas: 'small-caps',
      corteLinea: 'balance',
      spacing: '-0.05',
    })

    expect(codigo).toContain('word-spacing: 0.2em;')
    expect(codigo).toContain('font-variant: small-caps;')
    expect(codigo).toContain('text-wrap: balance;')
    expect(codigo).toContain('letter-spacing: -0.05em;')
  })

  it('emite la letra capitular solo cuando está activa', () => {
    expect(generateCode(TEXTO, ESTILOS)).not.toContain('::first-letter')

    const conCapitular = generateCode(TEXTO, {
      ...ESTILOS,
      letraCapitular: 'primera',
    })

    expect(conCapitular).toContain('  .texto p:first-of-type::first-letter {')
    expect(conCapitular).toContain('    float: left;')
    expect(conCapitular).toContain('    font-size: 3.2em;')
    expect(conCapitular).toContain('    line-height: 0.9;')
  })

  it('emite la opacidad solo cuando el bloque no es opaco', () => {
    expect(generateCode(TEXTO, ESTILOS)).not.toContain('opacity:')

    expect(generateCode(TEXTO, { ...ESTILOS, opacidad: '0.55' })).toContain(
      '    opacity: 0.55;',
    )
  })

  it('emite el borde y el radio solo cuando el borde está activo', () => {
    expect(generateCode(TEXTO, ESTILOS)).not.toContain('border-radius:')

    const conBorde = generateCode(TEXTO, {
      ...ESTILOS,
      borde: 'si',
      bordeAncho: '3',
      bordeColor: '#123456',
      bordeRadio: '20',
    })
    expect(conBorde).toContain('    border: 3px solid #123456;')
    expect(conBorde).toContain('    border-radius: 20px;')
  })

  it('emite el contorno solo cuando está activo', () => {
    const porDefecto = generateCode(TEXTO, ESTILOS)
    expect(porDefecto).not.toContain('-webkit-text-stroke:')
    expect(porDefecto).not.toContain('paint-order:')

    const conContorno = generateCode(TEXTO, {
      ...ESTILOS,
      contorno: 'si',
      contornoAncho: '2',
      contornoColor: '#123456',
    })
    expect(conContorno).toContain('    -webkit-text-stroke: 2px #123456;')
    expect(conContorno).toContain('    paint-order: stroke fill;')
  })

  it('emite la sombra de texto solo cuando está activa', () => {
    expect(generateCode(TEXTO, ESTILOS)).not.toContain('text-shadow:')

    expect(generateCode(TEXTO, { ...ESTILOS, sombra: 'suave' })).toContain(
      'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);',
    )
    expect(generateCode(TEXTO, { ...ESTILOS, sombra: 'resplandor' })).toContain(
      'text-shadow: 0 0 0.4em currentColor;',
    )
    expect(
      generateCode(TEXTO, {
        ...ESTILOS,
        sombra: 'personalizada',
        sombraX: '2',
        sombraY: '4',
        sombraDifuminado: '8',
        sombraColor: '#123456',
      }),
    ).toContain('text-shadow: 2px 4px 8px #123456;')
  })

  it('emite la selección personalizada solo cuando está activa', () => {
    expect(generateCode(TEXTO, ESTILOS)).not.toContain('::selection')

    const conSeleccion = generateCode(TEXTO, {
      ...ESTILOS,
      seleccion: 'personalizada',
      seleccionFondo: '#123456',
      seleccionTexto: '#abcdef',
    })

    expect(conSeleccion).toContain('  .texto ::selection {')
    expect(conSeleccion).toContain('    background-color: #123456;')
    expect(conSeleccion).toContain('    color: #abcdef;')
    expect(conSeleccion).toContain('    -webkit-text-fill-color: #abcdef;')
  })

  it('emite el degradado solo cuando está activo', () => {
    const porDefecto = generateCode(TEXTO, ESTILOS)
    expect(porDefecto).not.toContain('background-clip: text')
    expect(porDefecto).not.toContain('linear-gradient')

    const conDegradado = generateCode(TEXTO, {
      ...ESTILOS,
      degradado: 'degradado',
      degradadoInicio: '#000000',
      degradadoFin: '#FFFFFF',
    })

    // va en los hijos, no en el bloque: el fondo del article sigue visible
    expect(conDegradado).toContain('  .texto h2,')
    expect(conDegradado).toContain('  .texto h3,')
    expect(conDegradado).toContain('  .texto p {')
    expect(conDegradado).toContain(
      '    background-image: linear-gradient(135deg, #000000, #FFFFFF);',
    )
    expect(conDegradado).toContain('    -webkit-background-clip: text;')
    expect(conDegradado).toContain('    background-clip: text;')
    expect(conDegradado).toContain('    -webkit-text-fill-color: transparent;')
    expect(conDegradado).toContain('    color: transparent;')
  })

  it('mantiene visible la selección con degradado activo', () => {
    // sin selección propia, el texto seleccionado usa el color del navegador
    const sinSeleccion = generateCode(TEXTO, {
      ...ESTILOS,
      degradado: 'degradado',
    })
    expect(sinSeleccion).toContain(
      '    -webkit-text-fill-color: HighlightText;',
    )

    // con selección propia, el color elegido también rellena el texto
    const conSeleccion = generateCode(TEXTO, {
      ...ESTILOS,
      degradado: 'degradado',
      seleccion: 'personalizada',
      seleccionTexto: '#abcdef',
    })
    expect(conSeleccion).toContain('    -webkit-text-fill-color: #abcdef;')
    expect(conSeleccion).not.toContain('HighlightText')
  })

  it('emite las dos columnas solo cuando están activas', () => {
    const porDefecto = generateCode(TEXTO, ESTILOS)
    expect(porDefecto).not.toContain('column-count')
    expect(porDefecto).not.toContain('column-span')

    const conColumnas = generateCode(TEXTO, { ...ESTILOS, columnas: 'dos' })
    expect(conColumnas).toContain('    display: block;')
    expect(conColumnas).toContain('    column-count: 2;')
    expect(conColumnas).toContain('    column-gap: 2em;')
    expect(conColumnas).toContain('  .texto h2,')
    expect(conColumnas).toContain('  .texto h3 {')
    expect(conColumnas).toContain('    column-span: all;')
  })

  it('emite la tarjeta glass solo cuando está activa', () => {
    const porDefecto = generateCode(TEXTO, ESTILOS)
    expect(porDefecto).not.toContain('backdrop-filter:')

    const conGlass = generateCode(TEXTO, { ...ESTILOS, glass: 'si' })
    expect(conGlass).toContain('background: rgba(2, 2, 2, 0.55);')
    expect(conGlass).toContain('backdrop-filter: blur(14px) saturate(140%);')
    expect(conGlass).toContain(
      '-webkit-backdrop-filter: blur(14px) saturate(140%);',
    )
    expect(conGlass).toContain('box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);')
  })

  it('emite la animación de entrada y su fallback de movimiento reducido', () => {
    const porDefecto = generateCode(TEXTO, ESTILOS)
    expect(porDefecto).not.toContain('@keyframes')
    expect(porDefecto).not.toContain('prefers-reduced-motion')

    const conAnimacion = generateCode(TEXTO, {
      ...ESTILOS,
      animacion: 'entrada',
    })
    expect(conAnimacion).toContain('  @keyframes estila-texto-entrada {')
    expect(conAnimacion).toContain('      transform: translateY(0.6em);')
    expect(conAnimacion).toContain(
      '    animation: estila-texto-entrada 0.6s ease-out both;',
    )
    expect(conAnimacion).toContain(
      '  @media (prefers-reduced-motion: reduce) {',
    )
    expect(conAnimacion).toContain('      animation: none;')
  })

  it('emite fuente, peso y color del título solo cuando se personalizan', () => {
    /** @param {import('../types.js').Estilos} estilos */
    const bloqueTitulo = (estilos) => {
      const css = generateCss(estilos)
      return css.slice(css.indexOf('.texto h2 {'), css.indexOf('.texto p {'))
    }

    const porDefecto = bloqueTitulo(ESTILOS)
    expect(porDefecto).toContain('font-size: 1.5em;')
    expect(porDefecto).not.toContain('font-family:')
    expect(porDefecto).not.toContain('font-weight:')
    expect(porDefecto).not.toContain('color:')

    const propio = bloqueTitulo({
      ...ESTILOS,
      tituloFamilia: 'Georgia, serif',
      tituloPeso: '900',
      tituloColor: '#123456',
    })
    expect(propio).toContain('font-family: Georgia, serif;')
    expect(propio).toContain('font-weight: 900;')
    expect(propio).toContain('color: #123456;')
  })

  it('emite el bloque del subtítulo solo cuando se personaliza', () => {
    /** @param {import('../types.js').Estilos} estilos */
    const bloqueSubtitulo = (estilos) => {
      const css = generateCss(estilos)
      const inicio = css.indexOf('.texto h3 {')
      return inicio === -1 ? '' : css.slice(inicio, css.indexOf('.texto p {'))
    }

    expect(bloqueSubtitulo(ESTILOS)).toBe('')

    const soloColor = bloqueSubtitulo({
      ...ESTILOS,
      subtituloColor: '#abcdef',
    })
    expect(soloColor).toContain('color: #abcdef;')
    // al emitir la regla se fija el tamaño de partida: un reset no lo cambia
    expect(soloColor).toContain('font-size: 1.17em;')

    const soloEscala = bloqueSubtitulo({
      ...ESTILOS,
      escalaSubtitulo: '140',
    })
    expect(soloEscala).toContain('font-size: 1.4em;')

    const propio = bloqueSubtitulo({
      ...ESTILOS,
      subtituloFamilia: 'Georgia, serif',
      subtituloPeso: '700',
      subtituloColor: '#123456',
      escalaSubtitulo: '140',
    })
    expect(propio).toContain('font-size: 1.4em;')
    expect(propio).toContain('font-family: Georgia, serif;')
    expect(propio).toContain('font-weight: 700;')
    expect(propio).toContain('color: #123456;')
  })

  it('agrega la hoja de Google Fonts de la fuente propia del título', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      family: 'Open Sans, sans-serif',
      tituloFamilia: 'Roboto, sans-serif',
    })

    expect(codigo).toContain('family=Open+Sans')
    expect(codigo).toContain('family=Roboto')
    expect(codigo).toContain('<!-- Fuentes web:')
  })

  it('agrega la hoja de Google Fonts de la fuente propia del subtítulo', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      family: 'Open Sans, sans-serif',
      subtituloFamilia: 'Roboto, sans-serif',
    })

    expect(codigo).toContain('family=Open+Sans')
    expect(codigo).toContain('family=Roboto')
    expect(codigo).toContain('<!-- Fuentes web:')
  })

  it('no duplica la hoja si cuerpo, título y subtítulo comparten fuente web', () => {
    const codigo = generateCode(TEXTO, {
      ...ESTILOS,
      family: 'Roboto, sans-serif',
      tituloFamilia: 'Roboto, sans-serif',
      subtituloFamilia: 'Roboto, sans-serif',
    })

    expect(codigo.match(/fonts\.googleapis\.com/g)).toHaveLength(1)
    expect(codigo).toContain('<!-- Fuente web:')
  })

  it('agrega la hoja de Google Fonts solo para fuentes web', () => {
    const conWeb = generateCode(TEXTO, {
      ...ESTILOS,
      family: 'Roboto, sans-serif',
    })

    expect(conWeb).toContain(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap">',
    )
    expect(conWeb).toContain('<!-- Fuente web:')

    const conSistema = generateCode(TEXTO, ESTILOS)
    expect(conSistema).not.toContain('fonts.googleapis.com')
    expect(conSistema).not.toContain('<!-- Fuente web:')
  })
})

describe('generateHtml y generateCss', () => {
  it('el HTML no incluye el bloque de estilos', () => {
    const html = generateHtml(TEXTO, ESTILOS)

    expect(html).toContain(`<article class='texto'>`)
    expect(html).toContain('<h2>Titulo de prueba</h2>')
    expect(html).not.toContain('<style>')
    expect(html).not.toContain('font-size:')
  })

  it('el CSS no incluye el artículo ni las etiquetas style', () => {
    const css = generateCss(ESTILOS)

    expect(css).toContain('.texto {')
    expect(css).toContain('font-family: system-ui;')
    expect(css).toContain('.texto p {')
    expect(css).not.toContain('<style>')
    expect(css).not.toContain('<article')
  })

  it('las dos partes reconstruyen exactamente el snippet', () => {
    expect(
      `${generateHtml(TEXTO, ESTILOS)}\n\n<style>\n${generateCss(ESTILOS)}\n</style>`,
    ).toBe(generateCode(TEXTO, ESTILOS))
  })

  it('el HTML lleva la hoja de Google Fonts solo para fuentes web', () => {
    const conWeb = generateHtml(TEXTO, {
      ...ESTILOS,
      family: 'Roboto, sans-serif',
    })

    expect(conWeb).toContain(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap',
    )
    expect(conWeb).toContain('<!-- Fuente web:')
    expect(generateHtml(TEXTO, ESTILOS)).not.toContain('fonts.googleapis.com')
  })
})

describe('generateDocumento', () => {
  it('arma un documento completo con el CSS en el head', () => {
    const documento = generateDocumento(TEXTO, ESTILOS)

    expect(documento.startsWith('<!doctype html>')).toBe(true)
    expect(documento).toContain('<html lang="es">')
    expect(documento).toContain('<title>Titulo de prueba</title>')
    expect(documento).toContain(`<article class='texto'>`)
    expect(documento).toContain('font-family: system-ui;')
    // el <style> va antes de </head>, no dentro del body
    expect(documento.indexOf('<style>')).toBeLessThan(
      documento.indexOf('</head>'),
    )
    expect(documento).toContain('</body>\n</html>')
  })

  it('escapa el título y usa uno por defecto si está vacío', () => {
    expect(
      generateDocumento({ ...TEXTO, titulo: '<b>x</b>' }, ESTILOS),
    ).toContain('<title>&lt;b&gt;x&lt;/b&gt;</title>')

    expect(generateDocumento({ ...TEXTO, titulo: '   ' }, ESTILOS)).toContain(
      '<title>Estila tu Texto</title>',
    )
  })

  it('pone la hoja de Google Fonts en el head solo para fuentes web', () => {
    const conWeb = generateDocumento(TEXTO, {
      ...ESTILOS,
      family: 'Roboto, sans-serif',
    })
    const head = conWeb.slice(0, conWeb.indexOf('</head>'))

    expect(head).toContain(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap',
    )

    expect(generateDocumento(TEXTO, ESTILOS)).not.toContain(
      'fonts.googleapis.com',
    )
  })

  it('incluye la fuente propia del título en el head', () => {
    const documento = generateDocumento(TEXTO, {
      ...ESTILOS,
      tituloFamilia: 'Roboto, sans-serif',
    })
    const head = documento.slice(0, documento.indexOf('</head>'))

    expect(head).toContain('family=Roboto')
  })

  it('incluye la fuente propia del subtítulo en el head', () => {
    const documento = generateDocumento(TEXTO, {
      ...ESTILOS,
      subtituloFamilia: 'Open Sans, sans-serif',
    })
    const head = documento.slice(0, documento.indexOf('</head>'))

    expect(head).toContain('family=Open+Sans')
  })
})
