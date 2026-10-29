import { useContext, useState } from "react"
import { EstilosContext } from "../context/estilosContext.js"
import { estilosToStyleObject } from "../lib/estilos.js"

export const Visualizador = ({ texto, actualizarTexto }) => {
  const { estilos } = useContext(EstilosContext)
  const [textoInicial] = useState(texto)

  return (
    <section style={{ background: estilos.background }}>
      <article
        className='visualizador seccion'
        spellCheck='false'
        style={estilosToStyleObject(estilos)}
      >
        {/* contentEditable esta en CADA elemento para que no se elimine
          si se borrara su contenido, queda el elemento vacio */}
        <h2
          contentEditable="plaintext-only"
          onInput={(e) => actualizarTexto('titulo', e.target.textContent)}
        >
          {textoInicial.titulo}
        </h2>
        <p
          contentEditable="plaintext-only"
          onInput={(e) => actualizarTexto('parrafo1', e.target.textContent)}
        >
          {textoInicial.parrafo1}
        </p>
        <p
          contentEditable="plaintext-only"
          onInput={(e) => actualizarTexto('parrafo2', e.target.textContent)}
        >
          {textoInicial.parrafo2}
        </p>
        <h3
          contentEditable="plaintext-only"
          onInput={(e) => actualizarTexto('subtitulo', e.target.textContent)}
        >
          {textoInicial.subtitulo}
        </h3>
        <p
          contentEditable="plaintext-only"
          onInput={(e) => actualizarTexto('parrafo3', e.target.textContent)}
        >
          {textoInicial.parrafo3}
        </p>
      </article>
    </section>
  )
}