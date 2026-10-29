import { useContext } from "react"
import { EstilosContext } from "../context/estilosContext.js"
import { estilosToStyleObject } from "../lib/estilos.js"
import { EditableText } from "./EditableText.jsx"

// estructura del preview: qué campo edita, con qué etiqueta HTML y cómo
// nombra ese campo para lectores de pantalla
const CAMPOS = [
  { campo: 'titulo', etiqueta: 'h2', nombre: 'Título' },
  { campo: 'parrafo1', etiqueta: 'p', nombre: 'Párrafo 1' },
  { campo: 'parrafo2', etiqueta: 'p', nombre: 'Párrafo 2' },
  { campo: 'subtitulo', etiqueta: 'h3', nombre: 'Subtítulo' },
  { campo: 'parrafo3', etiqueta: 'p', nombre: 'Párrafo 3' },
]

export const Visualizador = ({ texto, actualizarTexto, restablecerTexto }) => {
  const { estilos } = useContext(EstilosContext)

  return (
    <section style={{ background: estilos.background }}>
      <div className='seccion'>
        <div className='visualizador-header'>
          <h2 className='titulo'>Vista previa</h2>
          <button type='button' onClick={restablecerTexto}>
            Restablecer texto ↺
          </button>
        </div>

        <article
          className='visualizador'
          spellCheck='false'
          style={estilosToStyleObject(estilos)}
        >
          {CAMPOS.map(({ campo, etiqueta, nombre }) => (
            <EditableText
              key={campo}
              etiqueta={etiqueta}
              nombre={nombre}
              valor={texto[campo]}
              onCambio={(valor) => actualizarTexto(campo, valor)}
            />
          ))}
        </article>
      </div>
    </section>
  )
}
