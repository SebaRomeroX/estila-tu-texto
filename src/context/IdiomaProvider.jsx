import { useCallback, useEffect, useMemo, useState } from 'react'
import { IdiomaContext } from './idiomaContext.js'
import {
  cargarIdioma,
  guardarIdioma,
  normalizarIdioma,
  traducir,
} from '../lib/i18n.js'

/**
 * Idioma de la interfaz: arranca con el guardado en este navegador, persiste
 * cada cambio y mantiene sincronizado el atributo lang del documento.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(cargarIdioma)

  useEffect(() => {
    document.documentElement.lang = idioma
    guardarIdioma(idioma)
  }, [idioma])

  const cambiarIdioma = useCallback(
    /** @param {string} nuevo */
    (nuevo) => {
      setIdioma(normalizarIdioma(nuevo))
    },
    [],
  )

  const t = useCallback(
    /**
     * @param {string} texto
     * @param {Record<string, string | number>} [datos]
     */
    (texto, datos) => traducir(idioma, texto, datos),
    [idioma],
  )

  const valor = useMemo(
    () => ({ idioma, cambiarIdioma, t }),
    [idioma, cambiarIdioma, t],
  )

  return (
    <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
  )
}
