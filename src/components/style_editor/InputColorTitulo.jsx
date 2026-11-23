import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'

/**
 * Color propio del título. El estado vacío significa heredar: el input de
 * color muestra el color del cuerpo, así al activarlo no hay salto de
 * contraste ni queda guardado un color viejo si el cuerpo cambia.
 */
export const InputColorTitulo = () => {
  const { estilos, actualizarEstilos } = useContext(EstilosContext)
  const propio = estilos.tituloColor !== ''

  return (
    <div className='campo-color'>
      <label>
        <span>Color título</span>
        <input
          type='color'
          value={propio ? estilos.tituloColor : estilos.color}
          onChange={(e) => actualizarEstilos('tituloColor', e.target.value)}
        />
      </label>
      <label className='campo-color-heredar'>
        <input
          type='checkbox'
          checked={propio}
          onChange={(e) =>
            actualizarEstilos(
              'tituloColor',
              e.target.checked ? estilos.color : '',
            )
          }
        />
        <span>Color propio</span>
      </label>
      <span className='valor-color' aria-hidden='true'>
        {propio ? estilos.tituloColor : 'heredado'}
      </span>
    </div>
  )
}
