import { useState } from "react"
import { EstilosContext } from "./estilosContext.js"

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function EstilosProvider ({ children }) {
  const [estilos, setEstilos] = useState(
    /** @type {import('../types.js').Estilos} */ ({
      color: '#F0F8FF',
      background: '#020202',
      family: 'system-ui',
      size: '1.2',
      weight: '400',
      spacing: '0.04',
      height: '1.4',
      gap: '1',
      align: 'left',
    })
  )

  /**
   * @param {import('../types.js').CampoEstilo} campo
   * @param {string} valor
   */
  function actualizarEstilos (campo, valor) {
    setEstilos(prev => ({...prev, [campo]: valor}))
  }

  return (
    <EstilosContext.Provider value={{ estilos, actualizarEstilos }}>
      {children}
    </EstilosContext.Provider>
  )
}
