import { useEffect, useRef, useState } from 'react'

/**
 * Estado de una acción de copiado al portapapeles, con vuelta a "espera" a
 * los 3 segundos. El timer se limpia al desmontar (sin setState tras unmount).
 *
 * @returns {{
 *   estado: 'espera' | 'ok' | 'error',
 *   copiar: (texto: string) => Promise<void>,
 * }}
 */
export function useCopiar() {
  const [estado, setEstado] = useState(
    /** @type {'espera' | 'ok' | 'error'} */ ('espera'),
  )
  const timerRef = useRef(/** @type {number | undefined} */ (undefined))

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  /**
   * @param {string} texto
   * @returns {Promise<void>}
   */
  function copiar(texto) {
    return navigator.clipboard
      .writeText(texto)
      .then(() => setEstado('ok'))
      .catch(() => setEstado('error'))
      .finally(() => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setEstado('espera'), 3000)
      })
  }

  return { estado, copiar }
}
