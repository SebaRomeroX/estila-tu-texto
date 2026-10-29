import { useContext } from "react"
import { EstilosContext } from "../../context/estilosContext.js"

/**
 * @param {import('../../types.js').ParametrosInput} props
 */
export const InputSelect = ({ elemento }) => {
  const { label, opciones, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  const valorObtenido = estilos[campo]
  
  return (
    <label>
      <span>{label}</span>
      <select
        onChange={(e) => actualizarEstilos(campo, e.target.value)}
        value={valorObtenido}
      >
        {
          opciones.map(opcion =>
            <option key={opcion.contenido} value={opcion.contenido}>{opcion.nombre}</option>
          )
        }
      </select>
    </label>
  )
}