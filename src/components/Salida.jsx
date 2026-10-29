import { useContext, useEffect, useRef, useState } from "react"
import { EstilosContext } from "../context/estilosContext.js"
import { generateCode } from "../lib/generateCode.js"

export const SalidaCodigo = ({ texto }) => {
  const { estilos } = useContext(EstilosContext)
  const [copiar, setCopiar] = useState('📝')
  const timerRef = useRef(null)

  // limpiar el timeout si el componente se desmonta (evita setState tras unmount)
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  // misma función para mostrar y para copiar → no pueden divergir
  const codigo = generateCode(texto, estilos)

  function copiarCodigo() {
    navigator.clipboard.writeText(codigo)
      .then(() => {
        setCopiar('✔')
      }).catch(() => {
        setCopiar('❗')
      }).finally(() => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopiar('📝'), 3000)
      })
  }

  return (
    <section className='seccion'>
      <article className='salida-codigo'>
        <header>
          <h2 className='titulo'>Codigo</h2>
          <button onClick={copiarCodigo}>Copiar <span>{copiar}</span></button>
        </header>

        <pre>{codigo}</pre>
      </article>

    </section>
  )
}
