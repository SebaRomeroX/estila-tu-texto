import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { IdiomaContext } from '../../context/idiomaContext.js'

/**
 * Color propio de un bloque (título o subtítulo). El estado vacío significa
 * heredar: el input de color muestra el color del cuerpo, así al activarlo no
 * hay salto de contraste ni queda guardado un color viejo si el cuerpo cambia.
 *
 * @param {{
 *   etiqueta: string,
 *   campo: import('../../types.js').CampoEstilo,
 *   etiquetaPropio: string,
 * }} props
 */
export const InputColorPropio = ({ etiqueta, campo, etiquetaPropio }) => {
  const { estilos, actualizarEstilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  const valor = estilos[campo]
  const propio = valor !== ''

  return (
    <div className='campo-color'>
      <label>
        <span>{t(etiqueta)}</span>
        <input
          type='color'
          value={propio ? valor : estilos.color}
          onChange={(e) => actualizarEstilos(campo, e.target.value)}
        />
      </label>
      <label className='campo-color-heredar'>
        <input
          type='checkbox'
          checked={propio}
          onChange={(e) =>
            actualizarEstilos(campo, e.target.checked ? estilos.color : '')
          }
        />
        <span>{t(etiquetaPropio)}</span>
      </label>
      <span className='valor-color' aria-hidden='true'>
        {propio ? valor : t('heredado')}
      </span>
    </div>
  )
}
