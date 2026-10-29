import { createContext } from 'react'

// contexto con forma explícita: consumirlo da { estilos, actualizarEstilos }
export const EstilosContext = createContext(
  /** @type {import('../types.js').ContextoEstilos | undefined} */ (undefined),
)
