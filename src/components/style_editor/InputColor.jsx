import { useContext } from "react"
import { EstilosContext } from "../../context/estilosContext.js"

export const InputColor = ({ elemento }) => {
  const { label, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  const valorObtenido = estilos[campo]

  return (
    <div className='campo-color'>
      <label>
        <span>{label}</span>
        <input
          type='color'
          onChange={(e) => actualizarEstilos(campo, e.target.value)}
          value={valorObtenido}
        />
      </label>
      {/* valor visible: el estado no depende solo del color (WCAG 1.4.1) */}
      <span className='valor-color' aria-hidden='true'>{valorObtenido}</span>
    </div>
  )
}
