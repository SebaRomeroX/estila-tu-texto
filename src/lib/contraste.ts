// Contraste de color según WCAG 2.1, sin dependencias.
// Fórmulas: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
//
// El objetivo es avisar en el editor cuando la combinación texto/fondo no es
// legible: el bug de P2-20 (aliceblue sobre beige) no lo detectaba nada.

import type { NivelContraste, ResultadoContraste, Rgb } from '../types'

/**
 * Acepta #rgb y #rrggbb (con o sin #). Devuelve null si no es hexadecimal.
 */
export function parseHex(valor: string): Rgb | null {
  const hex = String(valor).trim().replace(/^#/, '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null

  const completo = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const numero = Number.parseInt(completo, 16)

  return {
    r: (numero >> 16) & 255,
    g: (numero >> 8) & 255,
    b: numero & 255,
  }
}

/**
 * Linealiza un canal sRGB (0-255) como pide WCAG.
 */
function canalLineal(valor: number): number {
  const s = valor / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/**
 * Luminancia relativa de un color (0 = negro, 1 = blanco).
 */
export function luminanciaRelativa({ r, g, b }: Rgb): number {
  return (
    0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b)
  )
}

/**
 * Ratio de contraste entre dos colores hex (de 1:1 a 21:1), o null si alguno
 * no es un hexadecimal válido. El orden de los argumentos da igual.
 */
export function ratioContraste(color: string, fondo: string): number | null {
  const a = parseHex(color)
  const b = parseHex(fondo)
  if (!a || !b) return null

  const luminanciaA = luminanciaRelativa(a)
  const luminanciaB = luminanciaRelativa(b)
  const [clara, oscura] =
    luminanciaA > luminanciaB
      ? [luminanciaA, luminanciaB]
      : [luminanciaB, luminanciaA]

  return (clara + 0.05) / (oscura + 0.05)
}

/**
 * Nivel WCAG para texto normal: AAA (7:1), AA (4.5:1) y el umbral de 3:1 que
 * solo aplica a texto grande (>= 24px, o >= 18.66px en negrita).
 */
export function nivelContraste(ratio: number): NivelContraste {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA (texto grande)'
  return 'Insuficiente'
}

/**
 * Resultado listo para mostrar, o null si los colores no se pueden leer.
 */
export function evaluarContraste(
  color: string,
  fondo: string,
): ResultadoContraste | null {
  const ratio = ratioContraste(color, fondo)
  if (ratio === null) return null

  return { ratio, nivel: nivelContraste(ratio) }
}
