import { useEffect, useRef, useState } from 'react'

type EstadoCopia = 'espera' | 'ok' | 'error'

interface ResultadoCopiar {
  estado: EstadoCopia
  copiar: (texto: string) => Promise<void>
}

/**
 * Estado de una acción de copiado al portapapeles, con vuelta a "espera" a
 * los 3 segundos. El timer se limpia al desmontar (sin setState tras unmount).
 */
export function useCopiar(): ResultadoCopiar {
  const [estado, setEstado] = useState<EstadoCopia>('espera')
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  function copiar(texto: string): Promise<void> {
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
