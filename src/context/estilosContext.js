import { createContext } from 'react'
import { ESTILOS_POR_DEFECTO } from '../lib/estilos.js'

// valor por defecto con la misma forma que el provider: permite renderizar
// componentes sueltos en tests sin envolverlos y tipa el contexto sin
// `undefined` (strict)
/** @type {import('../types.js').ContextoEstilos} */
const CONTEXTO_POR_DEFECTO = {
  estilos: ESTILOS_POR_DEFECTO,
  actualizarEstilos: () => {},
  aplicarEstilos: () => {},
  historial: [ESTILOS_POR_DEFECTO],
  indiceHistorial: 0,
  puedeDeshacer: false,
  puedeRehacer: false,
  deshacer: () => {},
  rehacer: () => {},
  irAHistorial: () => {},
  limpiarHistorial: () => {},
}

export const EstilosContext = createContext(CONTEXTO_POR_DEFECTO)
