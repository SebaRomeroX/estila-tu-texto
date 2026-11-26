import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { descargarHtml } from './descargar.js'

/** @type {HTMLAnchorElement | null} */
let enlaceClickeado = null

beforeEach(() => {
  vi.useFakeTimers()
  enlaceClickeado = null
  // jsdom no implementa createObjectURL/revokeObjectURL: se definen para el test
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(() => 'blob:test'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
    /** @this {HTMLAnchorElement} */
    function () {
      enlaceClickeado = /** @type {HTMLAnchorElement} */ (this)
    },
  )
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
})

describe('descargarHtml', () => {
  it('crea el blob, dispara la descarga y libera la URL', async () => {
    descargarHtml('<h1>hola</h1>')

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = /** @type {Blob} */ (
      vi.mocked(URL.createObjectURL).mock.calls[0][0]
    )
    expect(blob.type).toBe('text/html;charset=utf-8')
    expect(await blob.text()).toBe('<h1>hola</h1>')

    expect(enlaceClickeado?.download).toBe('estila-tu-texto.html')
    expect(enlaceClickeado?.getAttribute('href')).toBe('blob:test')
    expect(enlaceClickeado?.hidden).toBe(true)
    // el <a> temporal no queda en el DOM
    expect(document.querySelector('a[download]')).toBeNull()

    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })

  it('acepta un nombre de archivo distinto', () => {
    descargarHtml('x', 'mi-texto.html')

    expect(enlaceClickeado?.download).toBe('mi-texto.html')
  })
})
