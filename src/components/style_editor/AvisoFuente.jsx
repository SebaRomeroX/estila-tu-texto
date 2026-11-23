import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { buscarFuente, fuenteDisponible } from '../../lib/fuentes.js'

/**
 * Aviso cuando alguna fuente elegida (cuerpo o título) es del sistema y no está
 * instalada: el preview caería al fallback y mostraría algo distinto de lo
 * prometido. Las web (self-hosteadas) y las genéricas nunca avisan.
 */
export const AvisoFuente = () => {
  const { estilos } = useContext(EstilosContext)
  const familias = [estilos.family]
  if (estilos.tituloFamilia !== 'heredar') familias.push(estilos.tituloFamilia)

  /** @type {import('../../types.js').Fuente[]} */
  const noInstaladas = []
  for (const familia of new Set(familias)) {
    const fuente = buscarFuente(familia)
    if (fuente && !fuenteDisponible(fuente.contenido)) {
      noInstaladas.push(fuente)
    }
  }

  // valor fuera del catálogo (estilo viejo) o todo disponible: nada que decir
  if (noInstaladas.length === 0) return null

  const nombres = noInstaladas.map((fuente) => `«${fuente.nombre}»`).join(' y ')
  const verbo =
    noInstaladas.length === 1 ? 'no está instalada' : 'no están instaladas'

  return (
    <p className='aviso-fuente' role='status'>
      {nombres} {verbo} en este equipo: la vista previa usa una fuente de
      respaldo. Elige una de las cargadas para que se vea igual en todos lados.
    </p>
  )
}
