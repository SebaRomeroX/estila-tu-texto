import { createContext } from 'react'
import { ESTILOS_POR_DEFECTO } from '../lib/estilos'
import type { ContextoEstilos } from '../types'

// valor por defecto con la misma forma que el provider: permite renderizar
// componentes sueltos en tests sin envolverlos y tipa el contexto sin
// `undefined` (strict)
const CONTEXTO_POR_DEFECTO: ContextoEstilos = {
  estilos: ESTILOS_POR_DEFECTO,
  actualizarEstilos: () => {},
  aplicarEstilos: () => {},
  puedeDeshacer: false,
  puedeRehacer: false,
  deshacer: () => {},
  rehacer: () => {},
  limpiarHistorial: () => {},
}

export const EstilosContext = createContext(CONTEXTO_POR_DEFECTO)
