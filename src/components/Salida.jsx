import { useContext, useState } from "react"
import { EstilosContext } from "../context/estilosContext.js"

export const SalidaCodigo = ({ texto }) => {
  const { estilos } = useContext(EstilosContext)
  const { color, background, size, family, weight, spacing, height, gap, align } = estilos
  const { titulo, parrafo1, parrafo2, subtitulo, parrafo3 } = texto
  const [copiar, setCopiar] = useState('📝')


  function copiarCodigo() {
    const codigo = document.getElementById('codigo').textContent

    navigator.clipboard.writeText(codigo)
      .then(() => {
        setCopiar('✔')
      }).catch(() => {
        setCopiar('❗')
      }).finally(() => {
        setTimeout(() => setCopiar('📝'), 3000)
      })
  }

  return (
    <section className='seccion'>
      <article className='salida-codigo'>
        <header>
          <h2 className='titulo'>Codigo</h2>
          <button onClick={copiarCodigo}>Copiar <span>{copiar}</span></button>
        </header>
      
        <pre id="codigo">{`
  <article class='texto'>
    <h2>${titulo}</h2>
    <p>${parrafo1}</p>
    <p>${parrafo2}</p>
    <h3>${subtitulo}</h3>
    <p>${parrafo3}</p>
  </article>

  <style>
    .texto {
      color: ${color};
      background: ${background};
      font-family: ${family};
      font-size: ${size}em;
      font-weight: ${weight};
      letter-spacing: ${spacing}em;
      line-height: ${height}em;
      display: flex;
      flex-direction: column;
      gap: ${gap}em;
      text-align: ${align};
      padding: 30px 60px;
    }
  </style>
        `}</pre>
      </article>

    </section>
  )
}