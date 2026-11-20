import { useContext } from 'react'
import { EstilosContext } from '../context/estilosContext.js'
import { estilosToPreviewStyle } from '../lib/estilos.js'
import { EditableText } from './EditableText.jsx'

// estructura del preview: qué campo edita, con qué etiqueta HTML y cómo
// nombra ese campo para lectores de pantalla
/** @type {Array<{ campo: import('../types.js').CampoTexto, etiqueta: string, nombre: string }>} */
const CAMPOS = [
  { campo: 'titulo', etiqueta: 'h2', nombre: 'Título' },
  { campo: 'parrafo1', etiqueta: 'p', nombre: 'Párrafo 1' },
  { campo: 'parrafo2', etiqueta: 'p', nombre: 'Párrafo 2' },
  { campo: 'subtitulo', etiqueta: 'h3', nombre: 'Subtítulo' },
  { campo: 'parrafo3', etiqueta: 'p', nombre: 'Párrafo 3' },
]

/**
 * @param {import('../types.js').ParametrosVisualizador} props
 */
export const Visualizador = ({ texto, actualizarTexto, restablecerTexto }) => {
  const { estilos } = useContext(EstilosContext)

  return (
    // el encabezado del preview vive sobre el fondo del usuario: debe usar
    // también SU color de texto, si no pierde contraste (ej. tema Editorial:
    // aliceblue sobre beige). La tipografía del header no se toca.
    <section style={{ background: estilos.background, color: estilos.color }}>
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
          style={estilosToPreviewStyle(estilos)}
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
