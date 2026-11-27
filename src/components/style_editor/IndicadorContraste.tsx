import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext'
import { IdiomaContext } from '../../context/idiomaContext'
import { evaluarContraste } from '../../lib/contraste'

interface ParametrosIndicadorContraste {
  etiqueta: string
  color: string
  fondo: string
}

/**
 * Ratio de contraste con su nivel WCAG. Es texto real (no solo color) y sin
 * aria-live: el input de color emite en cada movimiento y anunciarlo sería
 * ruido para lectores de pantalla.
 */
const IndicadorContrastePar = ({
  etiqueta,
  color,
  fondo,
}: ParametrosIndicadorContraste) => {
  const { t } = useContext(IdiomaContext)
  const resultado = evaluarContraste(color, fondo)

  // colores no parseables (storage editado a mano): no hay nada que informar
  if (!resultado) return null

  return (
    <p className='contraste'>
      <span className='contraste-etiqueta'>{etiqueta}</span>
      <strong>{resultado.ratio.toFixed(2)}:1</strong>
      <span aria-hidden='true'>·</span>
      {t(resultado.nivel)}
    </p>
  )
}

export const IndicadorContraste = () => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)

  // con fondo transparente el color guardado no pinta el bloque: el ratio es
  // una referencia para el fondo donde se vaya a incrustar
  const referencia =
    estilos.fondoTransparente === 'si' ? t(' (referencia)') : ''

  return (
    <IndicadorContrastePar
      etiqueta={`${t('Contraste texto/fondo')}${referencia}`}
      color={estilos.color}
      fondo={estilos.background}
    />
  )
}

/**
 * Mismo control para la selección personalizada. Solo se muestra cuando está
 * activa: si está apagada no hay colores propios que evaluar.
 */
export const IndicadorContrasteSeleccion = () => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  if (estilos.seleccion === 'none') return null

  return (
    <IndicadorContrastePar
      etiqueta={t('Contraste selección')}
      color={estilos.seleccionTexto}
      fondo={estilos.seleccionFondo}
    />
  )
}

/**
 * Contraste del color propio del título contra el fondo. Solo aparece cuando
 * el título dejó de heredar: si hereda, ya lo cubre el indicador principal.
 */
export const IndicadorContrasteTitulo = () => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  if (!estilos.tituloColor) return null

  const referencia =
    estilos.fondoTransparente === 'si' ? t(' (referencia)') : ''

  return (
    <IndicadorContrastePar
      etiqueta={`${t('Contraste título')}${referencia}`}
      color={estilos.tituloColor}
      fondo={estilos.background}
    />
  )
}

/**
 * Ídem para el color propio del subtítulo.
 */
export const IndicadorContrasteSubtitulo = () => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  if (!estilos.subtituloColor) return null

  const referencia =
    estilos.fondoTransparente === 'si' ? t(' (referencia)') : ''

  return (
    <IndicadorContrastePar
      etiqueta={`${t('Contraste subtítulo')}${referencia}`}
      color={estilos.subtituloColor}
      fondo={estilos.background}
    />
  )
}
