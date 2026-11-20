import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { buscarFuente, fuenteDisponible } from '../../lib/fuentes.js'

/**
 * Aviso cuando la fuente elegida es del sistema y no está instalada: el
 * preview caería al fallback y mostraría algo distinto de lo prometido.
 * Las web (self-hosteadas) y las genéricas nunca avisan.
 */
export const AvisoFuente = () => {
  const { estilos } = useContext(EstilosContext)
  const fuente = buscarFuente(estilos.family)

  // valor fuera del catálogo (estilo viejo) o fuente disponible: nada que decir
  if (!fuente || fuenteDisponible(estilos.family)) return null

  return (
    <p className='aviso-fuente' role='status'>
      «{fuente.nombre}» no está instalada en este equipo: la vista previa usa
      una fuente de respaldo. Elige una de las cargadas para que se vea igual en
      todos lados.
    </p>
  )
}
