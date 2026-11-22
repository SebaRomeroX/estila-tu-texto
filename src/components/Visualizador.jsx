import { useContext } from 'react'
import { EstilosContext } from '../context/estilosContext.js'
import { estilosToPreviewStyle } from '../lib/estilos.js'
import { PLANTILLAS, plantillaActiva } from '../lib/plantillas.js'
import { TEXTO_POR_DEFECTO } from '../lib/texto.js'
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
export const Visualizador = ({
  texto,
  actualizarTexto,
  restablecerTexto,
  cargarTexto,
}) => {
  const { estilos } = useContext(EstilosContext)
  const conCapitular = estilos.letraCapitular === 'primera'
  const conSeleccion = estilos.seleccion === 'personalizada'
  const activa = plantillaActiva(texto)

  /**
   * Aplica una plantilla. No pisa texto editado sin confirmación; si el texto
   * ya es el de la plantilla, no hace nada (evita un confirm inútil).
   *
   * @param {string} id
   */
  function aplicarPlantilla(id) {
    const plantilla = PLANTILLAS.find((candidata) => candidata.id === id)
    if (!plantilla) return

    const yaEsLaPlantilla = CAMPOS.every(
      ({ campo }) => texto[campo] === plantilla.texto[campo],
    )
    if (yaEsLaPlantilla) return

    const esElTextoPorDefecto = CAMPOS.every(
      ({ campo }) => texto[campo] === TEXTO_POR_DEFECTO[campo],
    )
    if (
      !esElTextoPorDefecto &&
      !window.confirm(
        `Se reemplazará el texto actual por la plantilla "${plantilla.nombre}". ¿Continuar?`,
      )
    ) {
      return
    }

    cargarTexto(plantilla.texto)
  }

  return (
    // el encabezado del preview vive sobre el fondo del usuario: debe usar
    // también SU color de texto, si no pierde contraste (ej. tema Editorial:
    // aliceblue sobre beige). La tipografía del header no se toca.
    <section style={{ background: estilos.background, color: estilos.color }}>
      <div className='seccion'>
        <div className='visualizador-header'>
          <h2 className='titulo'>Vista previa</h2>
          <div className='visualizador-acciones'>
            <span className='plantilla-selector'>
              <label htmlFor='plantilla-texto'>Plantilla</label>
              <select
                id='plantilla-texto'
                value={activa ?? ''}
                onChange={(e) => aplicarPlantilla(e.target.value)}
              >
                <option value=''>Elegir plantilla…</option>
                {PLANTILLAS.map((plantilla) => (
                  <option key={plantilla.id} value={plantilla.id}>
                    {plantilla.nombre}
                  </option>
                ))}
              </select>
            </span>
            <button type='button' onClick={restablecerTexto}>
              Restablecer texto ↺
            </button>
          </div>
        </div>

        <article
          className={
            'visualizador' +
            (conCapitular ? ' visualizador-capitular' : '') +
            (conSeleccion ? ' visualizador-seleccion' : '')
          }
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
