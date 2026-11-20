import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'

/**
 * Agrupa opciones consecutivas que comparten `grupo` (las fuentes lo traen;
 * el resto de selects no). Mantiene el orden del catálogo.
 *
 * @param {import('../../types.js').Opcion[]} opciones
 * @returns {Array<{ grupo?: string, opciones: import('../../types.js').Opcion[] }>}
 */
function agrupar(opciones) {
  /** @type {Array<{ grupo?: string, opciones: import('../../types.js').Opcion[] }>} */
  const grupos = []

  for (const opcion of opciones) {
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo.grupo === opcion.grupo) {
      ultimo.opciones.push(opcion)
    } else {
      grupos.push({ grupo: opcion.grupo, opciones: [opcion] })
    }
  }

  return grupos
}

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
        {agrupar(opciones).map(({ grupo, opciones: delGrupo }) => {
          const opcionesJsx = delGrupo.map((opcion) => (
            <option key={opcion.contenido} value={opcion.contenido}>
              {opcion.nombre}
            </option>
          ))

          // sin grupo: las opciones van sueltas dentro del <select>
          if (!grupo) return opcionesJsx

          return (
            <optgroup key={grupo} label={grupo}>
              {opcionesJsx}
            </optgroup>
          )
        })}
      </select>
    </label>
  )
}
