import { useCallback, useEffect, useMemo, useState } from 'react'
import { IdiomaContext } from './idiomaContext'
import {
  cargarIdioma,
  guardarIdioma,
  normalizarIdioma,
  traducir,
} from '../lib/i18n'
import type { ReactNode } from 'react'

interface ParametrosIdiomaProvider {
  children: ReactNode
}

/**
 * Idioma de la interfaz: arranca con el guardado en este navegador, persiste
 * cada cambio y mantiene sincronizado el atributo lang del documento.
 */
export function IdiomaProvider({ children }: ParametrosIdiomaProvider) {
  const [idioma, setIdioma] = useState(cargarIdioma)

  useEffect(() => {
    document.documentElement.lang = idioma
    guardarIdioma(idioma)
  }, [idioma])

  const cambiarIdioma = useCallback((nuevo: string) => {
    setIdioma(normalizarIdioma(nuevo))
  }, [])

  const t = useCallback(
    (texto: string, datos?: Record<string, string | number>) =>
      traducir(idioma, texto, datos),
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
