import { useContext, useState } from "react"
import { EstilosContext } from "../context/estilosContext.js"

export const Visualizador = ({ texto, actualizarTexto }) => {
  const { estilos } = useContext(EstilosContext)
  const { color, background, size, family, weight, spacing, height, gap, align } = estilos
  const [textoInicial] = useState(texto)

  return (
    <section style={{ background: background }}>
      <article
        className='visualizador seccion'
        spellCheck='false'
        style={{
          color: color,
          background: background,
          fontFamily: family,
          fontSize: `${size}em`,
          fontWeight: weight,
          letterSpacing: `${spacing}em`,
          lineHeight: `${height}em`,
          gap: `${gap}em`,
          textAlign: align
        }}
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