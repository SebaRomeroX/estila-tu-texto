import { describe, expect, it } from 'vitest'
import { ESTILOS_POR_DEFECTO } from './estilos.js'
import { PRESETS, presetActivo } from './presets.js'

describe('presetActivo', () => {
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
