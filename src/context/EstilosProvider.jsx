import { useState } from 'react'
import { EstilosContext } from './estilosContext.js'
import { ESTILOS_POR_DEFECTO } from '../lib/estilos.js'

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function EstilosProvider({ children }) {
  const [estilos, setEstilos] = useState(
    /** @type {import('../types.js').Estilos} */ ({ ...ESTILOS_POR_DEFECTO }),
  )

  /**
   * @param {import('../types.js').CampoEstilo} campo
   * @param {string} valor
   */
  function actualizarEstilos(campo, valor) {
    setEstilos((prev) => ({ ...prev, [campo]: valor }))
  }

  // reemplaza el set completo: lo usan los presets y el reset de estilos
  /**
   * @param {import('../types.js').Estilos} nuevos
   */
  function aplicarEstilos(nuevos) {
    setEstilos({ ...nuevos })
  }

  return (
    <EstilosContext.Provider
      value={{ estilos, actualizarEstilos, aplicarEstilos }}
    >
      {children}
    </EstilosContext.Provider>
  )
}
