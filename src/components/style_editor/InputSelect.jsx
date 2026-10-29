import { useContext } from "react"
import { EstilosContext } from "../../context/estilosContext.js"

export const InputSelect = ({ elemento }) => {
  const { label, opciones, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  const valorObtenido = estilos[campo]
  
  return (
    <label>
      <p>{label}</p>
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