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

/**
 * Mismo control para la selección personalizada. Solo se muestra cuando está
 * activa: si está apagada no hay colores propios que evaluar.
 */
export const IndicadorContrasteSeleccion = () => {
  const { estilos } = useContext(EstilosContext)
  if (estilos.seleccion === 'none') return null

  const resultado = evaluarContraste(
    estilos.seleccionTexto,
    estilos.seleccionFondo,
  )

  if (!resultado) return null

  return (
    <p className='contraste'>
      <span className='contraste-etiqueta'>Contraste selección</span>
      <strong>{resultado.ratio.toFixed(2)}:1</strong>
      <span aria-hidden='true'>·</span>
      {resultado.nivel}
    </p>
  )
}

/**
 * Contraste del color propio del título contra el fondo. Solo aparece cuando
 * el título dejó de heredar: si hereda, ya lo cubre el indicador principal.
 */
export const IndicadorContrasteTitulo = () => {
  const { estilos } = useContext(EstilosContext)
  if (!estilos.tituloColor) return null

  const resultado = evaluarContraste(estilos.tituloColor, estilos.background)
  if (!resultado) return null

  return (
    <p className='contraste'>
      <span className='contraste-etiqueta'>Contraste título</span>
      <strong>{resultado.ratio.toFixed(2)}:1</strong>
      <span aria-hidden='true'>·</span>
      {resultado.nivel}
    </p>
  )
}
