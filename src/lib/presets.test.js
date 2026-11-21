import { describe, expect, it } from 'vitest'
import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { PRESETS, esMismoEstilo, presetActivo } from './presets.js'

describe('esMismoEstilo', () => {
  it('es true con los mismos valores en todas las claves', () => {
    expect(esMismoEstilo({ ...ESTILOS_POR_DEFECTO }, PRESETS[0].estilos)).toBe(
      true,
    )
  })

  it('es false si cambia cualquier clave del dominio', () => {
    expect(
      esMismoEstilo(
        { ...ESTILOS_POR_DEFECTO, escalaTitulo: '200' },
        ESTILOS_POR_DEFECTO,
      ),
    ).toBe(false)
  })

  it('ignora claves que no son del dominio', () => {
    const conIntruso = /** @type {import('../types.js').Estilos} */ ({
      ...ESTILOS_POR_DEFECTO,
      intruso: 'x',
    })

    expect(esMismoEstilo(conIntruso, ESTILOS_POR_DEFECTO)).toBe(true)
  })
})

describe('presetActivo', () => {
  it('cada preset define todas las claves del dominio', () => {
    const claves = Object.keys(ESTILOS_POR_DEFECTO).sort()

    for (const preset of PRESETS) {
      expect(Object.keys(preset.estilos).sort()).toEqual(claves)
    }
  })

  it('reconoce los defaults como el tema Clásico', () => {
    expect(presetActivo({ ...ESTILOS_POR_DEFECTO })).toBe('clasico')
  })

  it('reconoce cada preset por sus propios valores', () => {
    for (const preset of PRESETS) {
      expect(presetActivo({ ...preset.estilos })).toBe(preset.id)
    }
  })

  it('devuelve null si algún valor fue editado a mano', () => {
    expect(
      presetActivo({ ...ESTILOS_POR_DEFECTO, color: '#123456' }),
    ).toBeNull()
  })
})
