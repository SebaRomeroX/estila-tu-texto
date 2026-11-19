import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { evaluarContraste } from '../../lib/contraste.js'

/**
 * Ratio de contraste texto/fondo con su nivel WCAG. Es texto real (no solo
 * color) y sin aria-live: el input de color emite en cada movimiento y
 * anunciarlo sería ruido para lectores de pantalla.
 */
export const IndicadorContraste = () => {
  const { estilos } = useContext(EstilosContext)
  const resultado = evaluarContraste(estilos.color, estilos.background)

  // colores no parseables (storage editado a mano): no hay nada que informar
  if (!resultado) return null

  return (
    <p className='contraste'>
      <span className='contraste-etiqueta'>Contraste texto/fondo</span>
      <strong>{resultado.ratio.toFixed(2)}:1</strong>
      <span aria-hidden='true'>·</span>
      {resultado.nivel}
    </p>
  )
}
