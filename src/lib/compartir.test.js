import { beforeEach, describe, expect, it } from 'vitest'
import {
  codificarEstado,
  crearEnlace,
  decodificarEstado,
  limpiarHashCompartido,
} from './compartir.js'
import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { TEXTO_POR_DEFECTO } from './texto.js'

const TEXTO = {
  ...TEXTO_POR_DEFECTO,
  titulo: 'Título con ñ, emoji 🎨 y\nsalto de línea',
}
const ESTILOS = { ...ESTILOS_POR_DEFECTO, color: '#123456' }

describe('codificarEstado / decodificarEstado', () => {
  it('hace roundtrip con acentos, emoji y saltos de línea', () => {
    const estado = decodificarEstado(`#s=${codificarEstado(TEXTO, ESTILOS)}`)

    expect(estado).toEqual({ texto: TEXTO, estilos: ESTILOS })
  })

  it('acepta el hash sin #', () => {
    expect(
      decodificarEstado(`s=${codificarEstado(TEXTO, ESTILOS)}`),
    ).not.toBeNull()
  })

  it('devuelve null sin enlace, con base64 roto o con JSON inválido', () => {
    expect(decodificarEstado('')).toBeNull()
    expect(decodificarEstado('#seccion')).toBeNull()
    expect(decodificarEstado('#s=%%%')).toBeNull()
    expect(decodificarEstado(`#s=${btoa('no es json')}`)).toBeNull()
    // base64 sin relleno y con longitud múltiplo de 4 (rama sin padding)
    expect(decodificarEstado('#s=YWJj')).toBeNull()
  })

  it('ignora enlaces de otra versión o que no son objetos', () => {
    expect(decodificarEstado(`#s=${btoa('{"v":2}')}`)).toBeNull()
    expect(decodificarEstado(`#s=${btoa('null')}`)).toBeNull()
    expect(decodificarEstado(`#s=${btoa('[1,2]')}`)).toBeNull()
  })

  it('sanea claves y tipos desconocidos', () => {
    const payload = btoa(
      JSON.stringify({
        v: 1,
        texto: { titulo: 'Hola', intruso: 'x', parrafo1: 42 },
        estilos: { color: '#abcdef', size: 5 },
      }),
    )

    const estado = decodificarEstado(`#s=${payload}`)

    expect(estado.texto.titulo).toBe('Hola')
    expect(estado.texto.parrafo1).toBe(TEXTO_POR_DEFECTO.parrafo1)
    expect(estado.texto).not.toHaveProperty('intruso')
    expect(estado.estilos.color).toBe('#abcdef')
    expect(estado.estilos.size).toBe(ESTILOS_POR_DEFECTO.size)
  })
})

describe('crearEnlace', () => {
  it('conserva path y query, y reemplaza el hash', () => {
    const enlace = crearEnlace(
      TEXTO,
      ESTILOS,
      'https://ejemplo.test/app?x=1#viejo',
    )
    const url = new URL(enlace)

    expect(url.pathname).toBe('/app')
    expect(url.search).toBe('?x=1')
    expect(url.hash.startsWith('#s=')).toBe(true)
    expect(decodificarEstado(url.hash)).toEqual({
      texto: TEXTO,
      estilos: ESTILOS,
    })
  })
})

describe('limpiarHashCompartido', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('quita el estado compartido válido', () => {
    window.location.hash = `s=${codificarEstado(TEXTO, ESTILOS)}`

    limpiarHashCompartido()

    expect(window.location.hash).toBe('')
  })

  it('respeta un ancla que no es un estado', () => {
    window.location.hash = 'seccion'

    limpiarHashCompartido()

    expect(window.location.hash).toBe('#seccion')
  })
})
