import { useContext } from 'react'
import { EstilosContext } from '../../context/estilosContext.js'
import { IdiomaContext } from '../../context/idiomaContext.js'
import { buscarFuente, fuenteDisponible } from '../../lib/fuentes.js'

/**
 * Aviso cuando alguna fuente elegida (cuerpo, título o subtítulo) es del
 * sistema y no está instalada: el preview caería al fallback y mostraría algo
 * distinto de lo prometido. Las web (self-hosteadas) y las genéricas nunca
 * avisan.
 */
export const AvisoFuente = () => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  const familias = [estilos.family]
  if (estilos.tituloFamilia !== 'heredar') familias.push(estilos.tituloFamilia)
  if (estilos.subtituloFamilia !== 'heredar') {
    familias.push(estilos.subtituloFamilia)
  }

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

  const nombres = noInstaladas.map((fuente) => `«${fuente.nombre}»`)
  const lista =
    nombres.length === 1
      ? nombres[0]
      : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
  const verbo =
    noInstaladas.length === 1 ? 'no está instalada' : 'no están instaladas'

  return (
    <p className='aviso-fuente' role='status'>
      {t(
        '{nombres} {verbo} en este equipo: la vista previa usa una fuente de respaldo. Elige una de las cargadas para que se vea igual en todos lados.',
        { nombres: lista, verbo: t(verbo) },
      )}
    </p>
  )
}
