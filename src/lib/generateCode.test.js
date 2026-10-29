import { describe, expect, it } from 'vitest'
import { escapeHtml, generateCode } from './generateCode.js'
import { estilosToStyleObject } from './estilos.js'

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
  it('aplica las unidades em a las propiedades numericas', () => {
    expect(estilosToStyleObject(ESTILOS)).toEqual({
      color: '#F0F8FF',
      background: '#020202',
      fontFamily: 'system-ui',
      fontSize: '1.2em',
      fontWeight: '400',
      letterSpacing: '0.04em',
      lineHeight: '1.4em',
      gap: '1em',
      textAlign: 'left',
    })
  })

  it('refleja cambios de estado en el objeto de estilo', () => {
    const estilo = estilosToStyleObject({ ...ESTILOS, size: '2' })
    expect(estilo.fontSize).toBe('2em')
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
  })
})
