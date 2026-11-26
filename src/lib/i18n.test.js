import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CLAVE_IDIOMA,
  cargarIdioma,
  guardarIdioma,
  normalizarIdioma,
  traducir,
} from './i18n.js'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('normalizarIdioma', () => {
  it('acepta en y cae a es para cualquier otro valor', () => {
    expect(normalizarIdioma('en')).toBe('en')
    expect(normalizarIdioma('es')).toBe('es')
    expect(normalizarIdioma('fr')).toBe('es')
    expect(normalizarIdioma('')).toBe('es')
  })
})

describe('traducir', () => {
  it('en español devuelve el texto original', () => {
    expect(traducir('es', 'Vista previa')).toBe('Vista previa')
  })

  it('en inglés traduce las claves conocidas', () => {
    expect(traducir('en', 'Vista previa')).toBe('Preview')
    expect(traducir('en', 'Deshacer')).toBe('Undo')
  })

  it('si falta una clave en inglés conserva el español', () => {
    expect(traducir('en', 'Texto sin traducción')).toBe('Texto sin traducción')
  })

  it('reemplaza los marcadores con los datos', () => {
    expect(
      traducir('es', 'Aplicar tema {nombre}', { nombre: 'Editorial' }),
    ).toBe('Aplicar tema Editorial')
    expect(
      traducir('en', 'Aplicar tema {nombre}', { nombre: 'Editorial' }),
    ).toBe('Apply Editorial theme')
  })

  it('deja el marcador visible si falta el dato', () => {
    expect(traducir('en', 'Tema «{nombre}» guardado')).toBe(
      'Theme "{nombre}" saved',
    )
  })
})

describe('cargarIdioma', () => {
  it('devuelve el idioma guardado o español si no hay nada', () => {
    expect(cargarIdioma()).toBe('es')

    localStorage.setItem(CLAVE_IDIOMA, 'en')
    expect(cargarIdioma()).toBe('en')

    localStorage.setItem(CLAVE_IDIOMA, 'fr')
    expect(cargarIdioma()).toBe('es')
  })

  it('cae a español si el storage lanza', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })

    expect(cargarIdioma()).toBe('es')
  })
})

describe('guardarIdioma', () => {
  it('normaliza y persiste el idioma', () => {
    guardarIdioma('en')
    expect(localStorage.getItem(CLAVE_IDIOMA)).toBe('en')

    guardarIdioma('fr')
    expect(localStorage.getItem(CLAVE_IDIOMA)).toBe('es')
  })

  it('no lanza si el storage está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota llena')
    })

    expect(() => guardarIdioma('en')).not.toThrow()
  })
})
