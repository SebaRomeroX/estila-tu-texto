import { createContext } from 'react'
import { traducir } from '../lib/i18n'
import type { ContextoIdioma } from '../types'

// valor por defecto en español: permite renderizar componentes sueltos en
// tests sin envolverlos en el provider
const IDIOMA_POR_DEFECTO: ContextoIdioma = {
  idioma: 'es',
  cambiarIdioma: () => {},
  t: (texto, datos) => traducir('es', texto, datos),
}

export const IdiomaContext = createContext(IDIOMA_POR_DEFECTO)
