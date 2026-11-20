import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { FUENTES, fuenteDisponible } from '../../lib/fuentes.js'

// orden de aparición de los grupos en el catálogo (web → sistema → genéricas)
const GRUPOS = [...new Set(FUENTES.map((fuente) => fuente.grupo))]

/**
 * Selector visual: cada fuente se muestra con su propia tipografía, así se
 * elige por lo que se ve y no por el nombre. Reemplaza al <select>, que
 * obligaba a probar a ciegas. Los grupos son los mismos del catálogo.
 */
export const SelectorFuente = () => {
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  return (
    <div className='selector-fuente'>
      <h3 className='selector-fuente-label'>Fuente</h3>
      {GRUPOS.map((grupo) => (
        <div key={grupo} className='selector-fuente-grupo'>
          <h4 className='selector-fuente-grupo-titulo'>{grupo}</h4>
          <div className='selector-fuente-opciones'>
            {FUENTES.filter((fuente) => fuente.grupo === grupo).map(
              (fuente) => {
                const activa = fuente.contenido === estilos.family
                // las web se self-hostean y las genéricas siempre existen
                const noInstalada =
                  !fuente.web && !fuenteDisponible(fuente.contenido)

                return (
                  <button
                    key={fuente.contenido}
                    type='button'
                    aria-pressed={activa}
                    onClick={() =>
                      actualizarEstilos('family', fuente.contenido)
                    }
                    style={{ fontFamily: fuente.contenido }}
                  >
                    {activa && (
                      <span
                        className='selector-fuente-check'
                        aria-hidden='true'
                      >
                        ✓
                      </span>
                    )}
                    <span>{fuente.nombre}</span>
                    {fuente.web && (
                      <span className='selector-fuente-badge'>cargada</span>
                    )}
                    {noInstalada && (
                      <span className='selector-fuente-badge'>
                        no instalada
                      </span>
                    )}
                  </button>
                )
              },
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
