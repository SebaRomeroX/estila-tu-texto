import { describe, expect, it } from 'vitest'
import {
  escapeHtml,
  generateCode,
  generateCss,
  generateDocumento,
  generateHtml,
} from './generateCode.js'
import {
  estilosToPreviewStyle,
  estilosToStyleObject,
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
      fontSize: '1.2em',
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
    expect(estilo.fontSize).toBe('2em')
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

describe('estilosToPreviewStyle', () => {
  it('agrega la variable de la escala del título sin tocar el resto', () => {
    const estilo = /** @type {Record<string, unknown>} */ (
      estilosToPreviewStyle({ ...ESTILOS, escalaTitulo: '180' })
    )

    expect(estilo['--escala-titulo']).toBe('1.8')
    expect(estilo.fontSize).toBe('1.2em')
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
    expect(codigo).toContain('font-size: 2em;')
    expect(codigo).toContain('text-align: center;')
    expect(codigo).not.toContain('font-size: 1.2em;')
  })

  it('genera el layout fijo del bloque', () => {
    const codigo = generateCode(TEXTO, ESTILOS)
    expect(codigo).toContain('display: flex;')
    expect(codigo).toContain('flex-direction: column;')
    expect(codigo).toContain('padding: 30px 60px;')
    expect(codigo).toContain('margin-inline: auto;')
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
})
