// Catálogo único de fuentes. Dos clases, con comportamientos distintos:
//  - web:      se self-hostean (src/fuentes.css + public/fonts). El preview
//              siempre las muestra igual, en cualquier equipo.
//  - sistema:  dependen de lo que tenga instalado el usuario; el preview puede
//              caer al fallback (por eso existe el aviso).
//  - genérica: familias CSS que todo navegador resuelve (serif, monospace...).
//
// El campo `contenido` es el que se guarda en Estilos.family y el que se emite
// en el snippet, así que incluye la pila de respaldo completa.

import type { Fuente } from '../types'

const WEB = 'Cargadas (siempre iguales)'
const SISTEMA = 'Del sistema (según tu equipo)'
const GENERICA = 'Genéricas (siempre disponibles)'

export const FUENTES: Fuente[] = [
  // --- self-hosteadas: el orden del catálogo define el del <optgroup> ---
  {
    nombre: 'Open Sans',
    contenido: 'Open Sans, sans-serif',
    web: true,
    // familia tal como la pide la CSS2 API de Google Fonts
    google: 'Open+Sans:wght@300..800',
    grupo: WEB,
  },
  {
    nombre: 'Roboto',
    contenido: 'Roboto, sans-serif',
    web: true,
    google: 'Roboto:wght@100..900',
    grupo: WEB,
  },

  // --- del sistema: no se cargan, se usan si están instaladas ---
  {
    nombre: 'Times New Roman',
    contenido: 'Times New Roman, Times, serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Georgia',
    contenido: 'Georgia, serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Garamond',
    contenido: 'Garamond, serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Palatino',
    contenido: 'Palatino, Palatino Linotype, serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Arial',
    contenido: 'Arial, Helvetica, sans-serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Helvetica',
    contenido: 'Helvetica, sans-serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Verdana',
    contenido: 'Verdana, Geneva, sans-serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Segoe UI',
    contenido: 'Segoe UI, Tahoma, sans-serif',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Courier New',
    contenido: 'Courier New, Courier, monospace',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Consolas',
    contenido: 'Consolas, Monaco, monospace',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Monaco',
    contenido: 'Monaco, monospace',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Comic Sans MS',
    contenido: 'Comic Sans MS, cursive',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Brush Script',
    contenido: 'Brush Script MT, cursive',
    web: false,
    grupo: SISTEMA,
  },
  {
    nombre: 'Papyrus',
    contenido: 'Papyrus, fantasy',
    web: false,
    grupo: SISTEMA,
  },

  // --- genéricas: las resuelve el navegador, nunca faltan ---
  {
    nombre: 'Serif (genérica)',
    contenido: 'serif',
    web: false,
    grupo: GENERICA,
  },
  {
    nombre: 'Sans-serif (genérica)',
    contenido: 'sans-serif',
    web: false,
    grupo: GENERICA,
  },
  {
    nombre: 'Monospace (genérica)',
    contenido: 'monospace',
    web: false,
    grupo: GENERICA,
  },
  {
    nombre: 'Cursive (genérica)',
    contenido: 'cursive',
    web: false,
    grupo: GENERICA,
  },
  {
    nombre: 'Fantasy (genérica)',
    contenido: 'fantasy',
    web: false,
    grupo: GENERICA,
  },
  {
    nombre: 'System UI',
    contenido: 'system-ui',
    web: false,
    grupo: GENERICA,
  },
]

// familias genéricas de CSS: no hace falta comprobarlas, siempre existen
const GENERICAS = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
])

/**
 * Busca una fuente del catálogo por el valor guardado en Estilos.family.
 * Devuelve undefined si el valor no está en el catálogo (por ejemplo, un
 * estilo viejo persistido): en ese caso no se avisa nada.
 */
export function buscarFuente(contenido: string): Fuente | undefined {
  return FUENTES.find((fuente) => fuente.contenido === contenido)
}

/**
 * Primera familia de una pila CSS, sin comillas: "Roboto, sans-serif" →
 * "Roboto". Es la que hay que preguntarle al navegador.
 */
export function primeraFamilia(familia: string): string {
  return String(familia)
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '')
}

/**
 * ¿El equipo puede mostrar esta fuente tal como se eligió?
 *  - web y genéricas: siempre true (las primeras se self-hostean; las
 *    segundas las resuelve el navegador).
 *  - del sistema: se consulta FontFaceSet. Si la API no existe (jsdom,
 *    navegadores viejos) o falla, se asume true: es preferible no avisar de
 *    más que mostrar una advertencia falsa.
 */
export function fuenteDisponible(familia: string): boolean {
  const fuente = buscarFuente(familia)
  if (!fuente || fuente.web) return true

  const nombre = primeraFamilia(familia)
  if (GENERICAS.has(nombre.toLowerCase())) return true

  if (typeof document === 'undefined' || !document.fonts) return true

  try {
    return document.fonts.check(`12px "${nombre}"`)
  } catch {
    return true
  }
}

/**
 * URL de la hoja de Google Fonts para una fuente web, o null si no aplica.
 * Se usa en el comentario del snippet: el código copiado debe verse igual
 * que el preview también fuera de esta app.
 */
export function enlaceGoogleFonts(familia: string): string | null {
  const fuente = buscarFuente(familia)
  if (!fuente?.web || !fuente.google) return null

  return `https://fonts.googleapis.com/css2?family=${fuente.google}&display=swap`
}
