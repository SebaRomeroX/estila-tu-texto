import { useEffect, useState } from 'react'
import { EstilosContext } from './estilosContext.js'
import { ESTILOS_POR_DEFECTO } from '../lib/estilos.js'
import { decodificarEstado } from '../lib/compartir.js'
import {
  CLAVE_ESTILOS,
  cargarObjeto,
  guardarObjeto,
} from '../lib/persistencia.js'

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function EstilosProvider({ children }) {
  // init lazy: un enlace compartido gana; si no hay, los estilos guardados
  const [estilos, setEstilos] = useState(
    () =>
      /** @type {import('../types.js').Estilos} */ (
        decodificarEstado(window.location.hash)?.estilos ??
          cargarObjeto(CLAVE_ESTILOS, ESTILOS_POR_DEFECTO)
      ),
  )

  // cada cambio de estilos se persiste (guardarObjeto nunca lanza)
  useEffect(() => {
    guardarObjeto(CLAVE_ESTILOS, estilos)
  }, [estilos])

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
