import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { IdiomaContext } from '../../context/idiomaContext.js'

/**
 * @param {import('../../types.js').ParametrosInput} props
 */
export const InputColor = ({ elemento }) => {
  const { label, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)

  const valorObtenido = estilos[campo]

  return (
    <div className='campo-color'>
      <label>
        <span>{t(label)}</span>
        <input
          type='color'
          onChange={(e) => actualizarEstilos(campo, e.target.value)}
          value={valorObtenido}
        />
      </label>
      {/* valor visible: el estado no depende solo del color (WCAG 1.4.1) */}
      <span className='valor-color' aria-hidden='true'>
        {valorObtenido}
      </span>
    </div>
  )
}
