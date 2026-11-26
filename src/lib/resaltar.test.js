import { describe, expect, it } from 'vitest'
import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { generateCode } from './generateCode.js'
import { resaltarCodigo } from './resaltar.js'

const TEXTO = {
  titulo: 'Titulo de prueba',
  parrafo1: 'Parrafo uno',
  parrafo2: 'Parrafo dos',
  subtitulo: 'Subtitulo',
  parrafo3: 'Parrafo tres',
}

/**
 * @param {import('../types.js').Token[][]} lineas
 */
const reconstruir = (lineas) =>
  lineas.map((tokens) => tokens.map((token) => token.texto).join('')).join('\n')

/**
 * @param {import('../types.js').Token[]} linea
 * @param {import('../types.js').TipoToken} tipo
 */
const buscar = (linea, tipo) => {
  const token = linea.find((elemento) => elemento.tipo === tipo)
  if (!token) throw new Error(`no se encontró el token ${tipo}`)
  return token
}

describe('resaltarCodigo', () => {
  it('es lossless: reconstruye el snippet exacto', () => {
    const codigo = generateCode(TEXTO, ESTILOS_POR_DEFECTO)

    expect(reconstruir(resaltarCodigo(codigo))).toBe(codigo)
  })

  it('clasifica etiquetas, atributos y valores HTML', () => {
    const [linea] = resaltarCodigo("<article class='texto'>")

    expect(buscar(linea, 'etiqueta').texto).toBe('article')
    expect(buscar(linea, 'atributo').texto).toBe('class')
    expect(buscar(linea, 'valor-html').texto).toBe('texto')
  })

  it('separa el texto de las etiquetas en una misma línea', () => {
    const [linea] = resaltarCodigo('<h2>Hola</h2>')

    const textos = linea
      .filter((token) => token.tipo === 'texto' && token.texto)
      .map((token) => token.texto)

    expect(textos).toEqual(['Hola'])
    expect(linea.filter((token) => token.tipo === 'etiqueta')).toHaveLength(2)
  })

  it('resalta selectores, propiedades y valores CSS', () => {
    const lineas = resaltarCodigo(
      '<style>\n  .texto {\n    color: #fff;\n  }\n</style>',
    )

    expect(buscar(lineas[1], 'selector').texto).toBe('.texto')
    expect(buscar(lineas[2], 'propiedad').texto).toBe('color')
    expect(buscar(lineas[2], 'valor-css').texto).toBe('#fff')
    expect(
      lineas[3].some(
        (token) => token.tipo === 'puntuacion' && token.texto === '}',
      ),
    ).toBe(true)
  })

  it('deja como texto plano lo que no reconoce (línea vacía incluida)', () => {
    const lineas = resaltarCodigo('<style>\n\n</style>')

    expect(lineas[1]).toEqual([{ tipo: 'texto', texto: '' }])
    expect(resaltarCodigo('texto suelto')[0]).toEqual([
      { tipo: 'texto', texto: 'texto suelto' },
    ])
  })
})
