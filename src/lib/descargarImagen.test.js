import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toPng } from 'html-to-image'
import { descargarImagen } from './descargarImagen.js'

vi.mock('html-to-image', () => ({ toPng: vi.fn() }))

/** @type {HTMLAnchorElement | null} */
let enlaceClickeado = null

beforeEach(() => {
  enlaceClickeado = null
  vi.mocked(toPng).mockReset()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
    function () {
      enlaceClickeado = /** @type {HTMLAnchorElement} */ (this)
    },
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('descargarImagen', () => {
  it('convierte el nodo a PNG y dispara la descarga', async () => {
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,abc')
    const nodo = document.createElement('article')

    await descargarImagen(nodo, '#020202')

    expect(toPng).toHaveBeenCalledWith(nodo, {
      backgroundColor: '#020202',
      cacheBust: true,
      pixelRatio: 2,
    })
    expect(enlaceClickeado?.download).toBe('estila-tu-texto.png')
    expect(enlaceClickeado?.getAttribute('href')).toBe(
      'data:image/png;base64,abc',
    )
    expect(enlaceClickeado?.hidden).toBe(true)
    // el <a> temporal no queda en el DOM
    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('acepta otro nombre y propaga el error de html-to-image', async () => {
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,xyz')

    await descargarImagen(
      document.createElement('article'),
      '#ffffff',
      'mi.png',
    )
    expect(enlaceClickeado?.download).toBe('mi.png')

    vi.mocked(toPng).mockRejectedValue(new Error('falló la captura'))

    await expect(
      descargarImagen(document.createElement('article'), '#ffffff'),
    ).rejects.toThrow('falló la captura')
  })
})
