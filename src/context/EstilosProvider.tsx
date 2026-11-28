import { useCallback, useEffect, useState } from 'react'
import { EstilosContext } from './estilosContext'
import { ESTILOS_POR_DEFECTO } from '../lib/estilos'
import { decodificarEstado } from '../lib/compartir'
import { CLAVE_ESTILOS, cargarObjeto, guardarObjeto } from '../lib/persistencia'
import type { CampoEstilo, Estilos } from '../types'
import type { ReactNode } from 'react'

// cuántos estados se conservan en la sesión (el historial no se persiste)
const LIMITE_HISTORIAL = 50
// cambios seguidos sobre el mismo campo dentro de esta ventana se funden en
// una sola entrada: arrastrar un color no llena el historial de pasos
const VENTANA_COALESCENCIA = 700

interface EstadoHistorial {
  entradas: Estilos[]
  indice: number
  coalescencia: { campo: CampoEstilo | null; momento: number }
}

interface ParametrosEstilosProvider {
  children: ReactNode
}

function estilosIniciales(): Estilos {
  // init lazy: un enlace compartido gana; si no hay, los estilos guardados
  return (
    decodificarEstado(window.location.hash)?.estilos ??
    cargarObjeto(CLAVE_ESTILOS, ESTILOS_POR_DEFECTO)
  )
}

function mismosEstilos(a: Estilos, b: Estilos): boolean {
  const campos = Object.keys(a) as CampoEstilo[]

  return campos.every((campo) => a[campo] === b[campo])
}

/**
 * Agrega un estado al historial (o reemplaza el último si es el mismo campo
 * dentro de la ventana de coalescencia). Al cambiar después de deshacer, el
 * futuro se descarta.
 */
function agregarEntrada(
  prev: EstadoHistorial,
  nuevo: Estilos,
  campo: CampoEstilo | null,
  ahora: number,
): EstadoHistorial {
  const base = prev.entradas.slice(0, prev.indice + 1)
  const puedeCoalescer =
    campo !== null &&
    base.length > 1 &&
    prev.coalescencia.campo === campo &&
    ahora - prev.coalescencia.momento < VENTANA_COALESCENCIA

  const entradas = puedeCoalescer
    ? [...base.slice(0, -1), nuevo]
    : [...base, nuevo]
  const recortadas = entradas.slice(-LIMITE_HISTORIAL)

  return {
    entradas: recortadas,
    indice: recortadas.length - 1,
    coalescencia: { campo, momento: ahora },
  }
}

export function EstilosProvider({ children }: ParametrosEstilosProvider) {
  const [historial, setHistorial] = useState<EstadoHistorial>(() => ({
    entradas: [estilosIniciales()],
    indice: 0,
    coalescencia: { campo: null, momento: 0 },
  }))

  const estilos = historial.entradas[historial.indice]

  // cada cambio de estilos se persiste (guardarObjeto nunca lanza)
  useEffect(() => {
    guardarObjeto(CLAVE_ESTILOS, estilos)
  }, [estilos])

  function actualizarEstilos(campo: CampoEstilo, valor: string) {
    const ahora = Date.now()

    setHistorial((prev) => {
      const actual = prev.entradas[prev.indice]
      if (actual[campo] === valor) return prev

      return agregarEntrada(prev, { ...actual, [campo]: valor }, campo, ahora)
    })
  }

  // reemplaza el set completo: lo usan los presets y el reset de estilos
  function aplicarEstilos(nuevos: Estilos) {
    const ahora = Date.now()

    setHistorial((prev) => {
      const actual = prev.entradas[prev.indice]
      if (mismosEstilos(actual, nuevos)) return prev

      return agregarEntrada(prev, { ...nuevos }, null, ahora)
    })
  }

  const deshacer = useCallback(() => {
    setHistorial((prev) => {
      if (prev.indice <= 0) return prev

      return {
        ...prev,
        indice: prev.indice - 1,
        coalescencia: { campo: null, momento: 0 },
      }
    })
  }, [])

  const rehacer = useCallback(() => {
    setHistorial((prev) => {
      if (prev.indice >= prev.entradas.length - 1) return prev

      return {
        ...prev,
        indice: prev.indice + 1,
        coalescencia: { campo: null, momento: 0 },
      }
    })
  }, [])

  function limpiarHistorial() {
    setHistorial((prev) => ({
      entradas: [prev.entradas[prev.indice]],
      indice: 0,
      coalescencia: { campo: null, momento: 0 },
    }))
  }

  // atajos: Ctrl/Cmd+Z deshace; Ctrl/Cmd+Shift+Z o Ctrl+Y rehace. Se ignoran
  // dentro de campos editables para no pisar el undo nativo del texto.
  useEffect(() => {
    function alPresionar(e: KeyboardEvent) {
      const objetivo = e.target
      if (
        objetivo instanceof HTMLElement &&
        (objetivo.isContentEditable ||
          /^(input|textarea|select)$/i.test(objetivo.tagName))
      ) {
        return
      }

      if (!(e.ctrlKey || e.metaKey) || e.altKey) return

      const tecla = e.key.toLowerCase()
      if (tecla === 'z' && !e.shiftKey) {
        e.preventDefault()
        deshacer()
      } else if ((tecla === 'z' && e.shiftKey) || tecla === 'y') {
        e.preventDefault()
        rehacer()
      }
    }

    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [deshacer, rehacer])

  return (
    <EstilosContext.Provider
      value={{
        estilos,
        actualizarEstilos,
        aplicarEstilos,
        puedeDeshacer: historial.indice > 0,
        puedeRehacer: historial.indice < historial.entradas.length - 1,
        deshacer,
        rehacer,
        limpiarHistorial,
      }}
    >
      {children}
    </EstilosContext.Provider>
  )
}
