import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { CLAVE_PRESETS } from './persistencia.js'
import {
  MAX_PRESETS,
  agregarPreset,
  cargarPresets,
  guardarPresets,
  quitarPreset,
} from './presetsPropios.js'

const ESTILOS = { ...ESTILOS_POR_DEFECTO, color: '#123456' }

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('cargarPresets', () => {
  it('sin nada guardado devuelve una lista vacía', () => {
    expect(cargarPresets()).toEqual([])
  })

  it('lee, recorta nombres y sanea cada entrada', () => {
    localStorage.setItem(
      CLAVE_PRESETS,
      JSON.stringify([
        { nombre: '  Uno  ', estilos: { color: '#abcdef', intruso: 'x' } },
        { nombre: '', estilos: ESTILOS },
        { nombre: 42, estilos: ESTILOS },
        null,
        { nombre: 'Dos', estilos: null },
      ]),
    )

    const presets = cargarPresets()

    expect(presets).toHaveLength(2)
    expect(presets[0].nombre).toBe('Uno')
    expect(presets[0].estilos.color).toBe('#abcdef')
    // claves desconocidas y faltantes se resuelven con los defaults
    expect(presets[0].estilos).not.toHaveProperty('intruso')
    expect(presets[0].estilos.size).toBe(ESTILOS_POR_DEFECTO.size)
    expect(presets[1]).toEqual({
      nombre: 'Dos',
      estilos: { ...ESTILOS_POR_DEFECTO },
    })
  })

  it('JSON inválido o que no es una lista devuelve []', () => {
    localStorage.setItem(CLAVE_PRESETS, '{roto')
    expect(cargarPresets()).toEqual([])

    localStorage.setItem(CLAVE_PRESETS, '"texto"')
    expect(cargarPresets()).toEqual([])
  })

  it('si localStorage falla al leer, no lanza y devuelve []', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })

    expect(cargarPresets()).toEqual([])
  })

  it('recorta la lista a MAX_PRESETS (conserva los más recientes)', () => {
    const muchos = Array.from({ length: MAX_PRESETS + 5 }, (_, indice) => ({
      nombre: `Tema ${indice}`,
      estilos: ESTILOS,
    }))
    localStorage.setItem(CLAVE_PRESETS, JSON.stringify(muchos))

    const presets = cargarPresets()

    expect(presets).toHaveLength(MAX_PRESETS)
    expect(presets[0].nombre).toBe('Tema 5')
  })
})

describe('guardarPresets', () => {
  it('persiste la lista', () => {
    guardarPresets([{ nombre: 'Uno', estilos: ESTILOS }])

    expect(JSON.parse(localStorage.getItem(CLAVE_PRESETS))).toEqual([
      { nombre: 'Uno', estilos: ESTILOS },
    ])
  })

  it('si localStorage falla al escribir, no lanza', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota llena')
    })

    expect(() => guardarPresets([])).not.toThrow()
  })
})

describe('agregarPreset', () => {
  it('agrega al final sin mutar la lista original', () => {
    const original = [{ nombre: 'Uno', estilos: ESTILOS }]

    const nuevos = agregarPreset(original, '  Dos  ', ESTILOS)

    expect(nuevos.map((preset) => preset.nombre)).toEqual(['Uno', 'Dos'])
    expect(original).toHaveLength(1)
  })

  it('reemplaza el mismo nombre sin distinguir mayúsculas', () => {
    const original = [
      { nombre: 'Uno', estilos: { ...ESTILOS, color: '#000000' } },
    ]

    const nuevos = agregarPreset(original, 'uno', ESTILOS)

    expect(nuevos).toHaveLength(1)
    expect(nuevos[0].nombre).toBe('uno')
    expect(nuevos[0].estilos.color).toBe('#123456')
  })

  it('ignora un nombre vacío', () => {
    const original = [{ nombre: 'Uno', estilos: ESTILOS }]

    expect(agregarPreset(original, '   ', ESTILOS)).toBe(original)
  })

  it('copia los estilos: el tema no cambia si el usuario sigue editando', () => {
    const estilos = { ...ESTILOS }

    const [preset] = agregarPreset([], 'Uno', estilos)

    expect(preset.estilos).not.toBe(estilos)
    expect(preset.estilos).toEqual(estilos)
  })

  it('respeta el tope de MAX_PRESETS', () => {
    const lleno = Array.from({ length: MAX_PRESETS }, (_, indice) => ({
      nombre: `Tema ${indice}`,
      estilos: ESTILOS,
    }))

    const nuevos = agregarPreset(lleno, 'Nuevo', ESTILOS)

    expect(nuevos).toHaveLength(MAX_PRESETS)
    expect(nuevos.at(-1)?.nombre).toBe('Nuevo')
    expect(nuevos[0].nombre).toBe('Tema 1')
  })
})

describe('quitarPreset', () => {
  it('quita por nombre exacto sin mutar la lista', () => {
    const original = [
      { nombre: 'Uno', estilos: ESTILOS },
      { nombre: 'Dos', estilos: ESTILOS },
    ]

    const nuevos = quitarPreset(original, 'Uno')

    expect(nuevos.map((preset) => preset.nombre)).toEqual(['Dos'])
    expect(original).toHaveLength(2)
  })
})
