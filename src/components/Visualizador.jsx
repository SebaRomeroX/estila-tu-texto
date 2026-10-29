import { useContext } from "react"
import { EstilosContext } from "../context/estilosContext.js"
import { estilosToStyleObject } from "../lib/estilos.js"
import { EditableText } from "./EditableText.jsx"

// estructura del preview: qué campo edita y con qué etiqueta HTML
const CAMPOS = [
  { campo: 'titulo', etiqueta: 'h2' },
  { campo: 'parrafo1', etiqueta: 'p' },
  { campo: 'parrafo2', etiqueta: 'p' },
  { campo: 'subtitulo', etiqueta: 'h3' },
  { campo: 'parrafo3', etiqueta: 'p' },
]

export const Visualizador = ({ texto, actualizarTexto, restablecerTexto }) => {
  const { estilos } = useContext(EstilosContext)

  return (
    <section style={{ background: estilos.background }}>
      <div className='seccion'>
        <div className='visualizador-header'>
          <button type='button' onClick={restablecerTexto}>
            Restablecer texto ↺
          </button>
        </div>

        <article
          className='visualizador'
          spellCheck='false'
          style={estilosToStyleObject(estilos)}
        >
          {CAMPOS.map(({ campo, etiqueta }) => (
            <EditableText
              key={campo}
              etiqueta={etiqueta}
              valor={texto[campo]}
              onCambio={(valor) => actualizarTexto(campo, valor)}
            />
          ))}
        </article>
      </div>
    </section>
  )
}
