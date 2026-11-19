import { describe, expect, it } from 'vitest'
import {
  evaluarContraste,
  luminanciaRelativa,
  nivelContraste,
  parseHex,
  ratioContraste,
} from './contraste.js'

describe('parseHex', () => {
  it('lee #rrggbb y #rgb, con o sin almohadilla', () => {
    expect(parseHex('#F0F8FF')).toEqual({ r: 240, g: 248, b: 255 })
    expect(parseHex('020202')).toEqual({ r: 2, g: 2, b: 2 })
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 })
  })

  it('devuelve null si no es un hexadecimal válido', () => {
    expect(parseHex('red')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
    expect(parseHex('')).toBeNull()
  })
})

describe('luminanciaRelativa', () => {
  it('va de 0 (negro) a 1 (blanco)', () => {
    expect(luminanciaRelativa({ r: 0, g: 0, b: 0 })).toBe(0)
    expect(luminanciaRelativa({ r: 255, g: 255, b: 255 })).toBe(1)
  })
})

describe('ratioContraste', () => {
  it('negro sobre blanco es el máximo 21:1', () => {
    expect(ratioContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  it('el mismo color da 1:1 y el orden no importa', () => {
    expect(ratioContraste('#123456', '#123456')).toBeCloseTo(1, 5)
    expect(ratioContraste('#000000', '#FFFFFF')).toBeCloseTo(
      ratioContraste('#FFFFFF', '#000000'),
      5,
    )
  })

  it('devuelve null si algún color no es válido', () => {
    expect(ratioContraste('rojo', '#FFFFFF')).toBeNull()
    expect(ratioContraste('#FFFFFF', 'transparent')).toBeNull()
  })
})

describe('nivelContraste', () => {
  it('aplica los umbrales WCAG', () => {
    expect(nivelContraste(21)).toBe('AAA')
    expect(nivelContraste(7)).toBe('AAA')
    expect(nivelContraste(6.9)).toBe('AA')
    expect(nivelContraste(4.5)).toBe('AA')
    expect(nivelContraste(4.4)).toBe('AA (texto grande)')
    expect(nivelContraste(3)).toBe('AA (texto grande)')
    expect(nivelContraste(2.9)).toBe('Insuficiente')
  })
})

describe('evaluarContraste', () => {
  it('devuelve ratio y nivel para colores válidos', () => {
    expect(evaluarContraste('#FFFFFF', '#000000')).toEqual({
      ratio: 21,
      nivel: 'AAA',
    })
  })

  it('devuelve null si no puede calcular el ratio', () => {
    expect(evaluarContraste('', '#FFFFFF')).toBeNull()
  })
})
