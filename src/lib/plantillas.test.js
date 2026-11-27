import { describe, expect, it } from 'vitest'
import { PLANTILLAS, plantillaActiva } from './plantillas'
import { TEXTO_POR_DEFECTO } from './texto'

const CAMPOS = Object.keys(TEXTO_POR_DEFECTO)

describe('plantillas de texto', () => {
  it('tiene al menos cuatro plantillas con ids y nombres únicos', () => {
    expect(PLANTILLAS.length).toBeGreaterThanOrEqual(4)

    const ids = PLANTILLAS.map((plantilla) => plantilla.id)
    const nombres = PLANTILLAS.map((plantilla) => plantilla.nombre)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(nombres).size).toBe(nombres.length)
    expect(ids.every((id) => id.trim() !== '')).toBe(true)
  })

  it('cada plantilla completa todos los campos del texto', () => {
    for (const plantilla of PLANTILLAS) {
      expect(Object.keys(plantilla.texto).sort()).toEqual([...CAMPOS].sort())

      for (const valor of Object.values(plantilla.texto)) {
        expect(valor.trim()).not.toBe('')
      }
    }
  })

  it('detecta la plantilla activa y devuelve null si el texto fue editado', () => {
    const [ensayo] = PLANTILLAS

    expect(plantillaActiva(ensayo.texto)).toBe(ensayo.id)
    expect(plantillaActiva({ ...ensayo.texto, titulo: 'Otro título' })).toBe(
      null,
    )
  })
})
