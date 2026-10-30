import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CLAVE_ESTILOS, cargarObjeto, guardarObjeto } from './persistencia.js'

const POR_DEFECTO = { color: '#000000', size: '1' }

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('cargarObjeto', () => {
  it('sin nada guardado devuelve una copia de los defaults', () => {
    const cargado = cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)

    expect(cargado).toEqual(POR_DEFECTO)
    // es una copia: mutar el resultado no toca los defaults
    expect(cargado).not.toBe(POR_DEFECTO)
  })

  it('fusiona lo guardado con los defaults', () => {
    localStorage.setItem(
      CLAVE_ESTILOS,
      JSON.stringify({ color: '#123456', size: '1.5' }),
    )

    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual({
      color: '#123456',
      size: '1.5',
    })
  })

  it('ignora claves desconocidas y valores con tipo incorrecto', () => {
    localStorage.setItem(
      CLAVE_ESTILOS,
      JSON.stringify({ color: 123, intruso: 'x', size: '2' }),
    )

    // color (número) cae al default; intruso no existe en el dominio
    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual({
      color: '#000000',
      size: '2',
    })
  })

  it('JSON corrupto cae a los defaults', () => {
    localStorage.setItem(CLAVE_ESTILOS, '{esto no es json')

    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual(POR_DEFECTO)
  })

  it('un JSON válido que no es objeto cae a los defaults', () => {
    localStorage.setItem(CLAVE_ESTILOS, '"solo un string"')
    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual(POR_DEFECTO)

    localStorage.setItem(CLAVE_ESTILOS, 'null')
    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual(POR_DEFECTO)
  })

  it('si localStorage falla al leer, cae a los defaults', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })

    expect(cargarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).toEqual(POR_DEFECTO)
  })
})

describe('guardarObjeto', () => {
  it('escribe el objeto serializado', () => {
    guardarObjeto(CLAVE_ESTILOS, { color: '#abcdef', size: '1.2' })

    expect(JSON.parse(localStorage.getItem(CLAVE_ESTILOS))).toEqual({
      color: '#abcdef',
      size: '1.2',
    })
  })

  it('si localStorage falla al escribir, no lanza', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota llena')
    })

    expect(() => guardarObjeto(CLAVE_ESTILOS, POR_DEFECTO)).not.toThrow()
  })
})
