import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext'
import { IdiomaContext } from '../../context/idiomaContext'
import { FUENTES, fuenteDisponible } from '../../lib/fuentes'

// orden de aparición de los grupos en el catálogo (web → sistema → genéricas)
const GRUPOS = [...new Set(FUENTES.map((fuente) => fuente.grupo))]

/**
 * Selector de fuente: un <select> con un <optgroup> por categoría del catálogo
 * (cargadas, del sistema y genéricas). Cada opción avisa si es web o si el
 * sistema no la tiene instalada.
 */
export const SelectorFuente = () => {
  const { estilos, actualizarEstilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)

  return (
    <label className='selector-fuente'>
      <span className='selector-fuente-label'>{t('Fuente')}</span>
      <select
        value={estilos.family}
        onChange={(e) => actualizarEstilos('family', e.target.value)}
      >
        {GRUPOS.map((grupo) => (
          <optgroup key={grupo} label={t(grupo)}>
            {FUENTES.filter((fuente) => fuente.grupo === grupo).map(
              (fuente) => {
                // las web se self-hostean y las genéricas siempre existen
                const noInstalada =
                  !fuente.web && !fuenteDisponible(fuente.contenido)
                const estado = fuente.web
                  ? ` · ${t('cargada')}`
                  : noInstalada
                    ? ` · ${t('no instalada')}`
                    : ''

                return (
                  <option
                    key={fuente.contenido}
                    value={fuente.contenido}
                    style={{ fontFamily: fuente.contenido }}
                  >
                    {t(fuente.nombre)}
                    {estado}
                  </option>
                )
              },
            )}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
