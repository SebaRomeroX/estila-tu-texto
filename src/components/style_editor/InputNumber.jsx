import { useContext } from "react"
import { EstilosContext } from "../../context/estilosContext.js"

export const InputNumber = ({ elemento }) => {
  const { label, min, max, step, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  const valorObtenido = estilos[campo]
  
  return (
    <label>
      <p>{label}</p>
      <input
        type="number"
        onChange={(e) => actualizarEstilos(campo, e.target.value)}
        min={min}
        max={max}
        step={step}
        defaultValue={valorObtenido}
      />
    </label>
  )
}