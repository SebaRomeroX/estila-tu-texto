import { createContext } from 'react'
import { traducir } from '../lib/i18n.js'

// valor por defecto en español: permite renderizar componentes sueltos en
// tests sin envolverlos en el provider
/** @type {import('../types.js').ContextoIdioma} */
const IDIOMA_POR_DEFECTO = {
  idioma: 'es',
  cambiarIdioma: () => {},
  t: (texto, datos) => traducir('es', texto, datos),
}

export const IdiomaContext = createContext(IDIOMA_POR_DEFECTO)
