import { useContext, useEffect, useRef, useState } from "react"
import { EstilosContext } from "../context/estilosContext.js"
import { generateCode } from "../lib/generateCode.js"

// feedback del copiar: emoji para la vista, texto para lectores de pantalla
const ESTADOS_COPIA = {
  espera: { emoji: '📝', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'Código copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'Error al copiar el código' },
}

export const SalidaCodigo = ({ texto }) => {
  const { estilos } = useContext(EstilosContext)
  const [estadoCopia, setEstadoCopia] = useState('espera')
  const timerRef = useRef(null)

  // limpiar el timeout si el componente se desmonta (evita setState tras unmount)
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  // misma función para mostrar y para copiar → no pueden divergir
  const codigo = generateCode(texto, estilos)
  const { emoji, mensaje } = ESTADOS_COPIA[estadoCopia]

  function copiarCodigo() {
    navigator.clipboard.writeText(codigo)
      .then(() => {
        setEstadoCopia('ok')
      }).catch(() => {
        setEstadoCopia('error')
      }).finally(() => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setEstadoCopia('espera'), 3000)
      })
  }

  return (
    <section className='seccion'>
      <article className='salida-codigo'>
        <header>
          <h2 className='titulo'>Codigo</h2>
          <button type='button' onClick={copiarCodigo}>
            Copiar <span aria-hidden='true'>{emoji}</span>
            <span className='sr-only' role='status' aria-live='polite'>{mensaje}</span>
          </button>
        </header>

        <pre>{codigo}</pre>
      </article>

    </section>
  )
}
