import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { IdiomaContext } from '../../context/idiomaContext.js'

/**
 * @param {import('../../types.js').ParametrosInputSelect} props
 */
export const InputSelect = ({ elemento }) => {
  const { label, opciones, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)

  const valorObtenido = estilos[campo]

  return (
    <label>
      <span>{t(label)}</span>
      <select
        onChange={(e) => actualizarEstilos(campo, e.target.value)}
        value={valorObtenido}
      >
        {opciones.map((opcion) => (
          <option key={opcion.contenido} value={opcion.contenido}>
            {t(opcion.nombre)}
          </option>
        ))}
      </select>
    </label>
  )
}
