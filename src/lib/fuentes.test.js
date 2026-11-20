import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FUENTES,
  buscarFuente,
  enlaceGoogleFonts,
  fuenteDisponible,
  primeraFamilia,
} from './fuentes.js'

afterEach(() => {
  // si un test mockeó FontFaceSet, no debe filtrarse al siguiente
  delete (/** @type {any} */ (document).fonts)
})

/**
 * Instala un document.fonts falso con el resultado pedido.
 *
 * @param {boolean | (() => never)} resultado
 */
function mockFonts(resultado) {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: {
      check: vi.fn(
        typeof resultado === 'function' ? resultado : () => resultado,
      ),
    },
  })
}

describe('catálogo de fuentes', () => {
  it('todas tienen nombre, contenido y grupo, sin contenidos repetidos', () => {
    for (const fuente of FUENTES) {
      expect(fuente.nombre).toBeTruthy()
      expect(fuente.contenido).toBeTruthy()
      expect(fuente.grupo).toBeTruthy()
      expect(typeof fuente.web).toBe('boolean')
    }

    const contenidos = FUENTES.map((fuente) => fuente.contenido)
    expect(new Set(contenidos).size).toBe(contenidos.length)
  })

  it('las fuentes web declaran su familia de Google Fonts', () => {
    const web = FUENTES.filter((fuente) => fuente.web)

    expect(web.map((fuente) => fuente.nombre)).toEqual(['Open Sans', 'Roboto'])
    for (const fuente of web) expect(fuente.google).toBeTruthy()
  })
})

describe('buscarFuente', () => {
  it('encuentra por el valor que se guarda en Estilos.family', () => {
    expect(buscarFuente('Roboto, sans-serif')?.nombre).toBe('Roboto')
    expect(buscarFuente('system-ui')?.nombre).toBe('System UI')
  })

  it('devuelve undefined para valores fuera del catálogo', () => {
    expect(buscarFuente('Mi Fuente Inventada, serif')).toBeUndefined()
    expect(buscarFuente('')).toBeUndefined()
  })
})

describe('primeraFamilia', () => {
  it('toma la primera familia de la pila y le quita las comillas', () => {
    expect(primeraFamilia('Roboto, sans-serif')).toBe('Roboto')
    expect(primeraFamilia('"Open Sans", sans-serif')).toBe('Open Sans')
    expect(primeraFamilia("'Times New Roman', Times, serif")).toBe(
      'Times New Roman',
    )
    expect(primeraFamilia('  Georgia , serif')).toBe('Georgia')
    expect(primeraFamilia('serif')).toBe('serif')
  })
})

describe('fuenteDisponible', () => {
  it('las web y las genéricas siempre están disponibles', () => {
    mockFonts(false)

    expect(fuenteDisponible('Roboto, sans-serif')).toBe(true)
    expect(fuenteDisponible('Open Sans, sans-serif')).toBe(true)
    expect(fuenteDisponible('serif')).toBe(true)
    expect(fuenteDisponible('system-ui')).toBe(true)
  })

  it('sin FontFaceSet (jsdom) asume que sí, para no avisar de más', () => {
    expect(document.fonts).toBeUndefined()
    expect(fuenteDisponible('Georgia, serif')).toBe(true)
  })

  it('consulta FontFaceSet para las fuentes del sistema', () => {
    mockFonts(false)
    expect(fuenteDisponible('Georgia, serif')).toBe(false)

    mockFonts(true)
    expect(fuenteDisponible('Georgia, serif')).toBe(true)

    // consulta la primera familia, sin la pila de respaldo
    expect(document.fonts.check).toHaveBeenCalledWith('12px "Georgia"')
  })

  it('si la consulta falla, no rompe ni avisa', () => {
    mockFonts(() => {
      throw new Error('boom')
    })

    expect(fuenteDisponible('Georgia, serif')).toBe(true)
  })

  it('un valor fuera del catálogo no se puede evaluar: true', () => {
    mockFonts(false)
    expect(fuenteDisponible('Mi Fuente Inventada, serif')).toBe(true)
  })
})

describe('enlaceGoogleFonts', () => {
  it('arma la hoja CSS2 solo para fuentes web', () => {
    expect(enlaceGoogleFonts('Roboto, sans-serif')).toBe(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap',
    )
    expect(enlaceGoogleFonts('Open Sans, sans-serif')).toContain(
      'Open+Sans:wght@300..800',
    )
  })

  it('devuelve null para fuentes del sistema o desconocidas', () => {
    expect(enlaceGoogleFonts('Georgia, serif')).toBeNull()
    expect(enlaceGoogleFonts('serif')).toBeNull()
    expect(enlaceGoogleFonts('Mi Fuente, serif')).toBeNull()
  })
})
