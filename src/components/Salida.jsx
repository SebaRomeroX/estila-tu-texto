import { useContext, useMemo } from 'react'
import { EstilosContext } from '../context/estilosContext.js'
import { crearEnlace } from '../lib/compartir.js'
import { descargarHtml } from '../lib/descargar.js'
import { generateCode, generateDocumento } from '../lib/generateCode.js'
import { resaltarCodigo } from '../lib/resaltar.js'
import { CodigoResaltado } from './CodigoResaltado.jsx'
import { useCopiar } from './useCopiar.js'

// feedback del copiar: emoji para la vista, texto para lectores de pantalla
/** @type {Record<string, { emoji: string, mensaje: string }>} */
const ESTADOS_COPIA = {
  espera: { emoji: '📝', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'Código copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'Error al copiar el código' },
}

/** @type {Record<string, { emoji: string, mensaje: string }>} */
const ESTADOS_ENLACE = {
  espera: { emoji: '🔗', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'Enlace copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'No se pudo copiar el enlace' },
}

/**
 * @param {import('../types.js').ParametrosSalida} props
 */
export const SalidaCodigo = ({ texto }) => {
  const { estilos } = useContext(EstilosContext)
  const copia = useCopiar()
  const enlace = useCopiar()

  // misma función para mostrar y para copiar → no pueden divergir
  const codigo = generateCode(texto, estilos)
  // el resaltado es solo de presentación: parte del mismo string
  const lineas = useMemo(() => resaltarCodigo(codigo), [codigo])
  const { emoji, mensaje } = ESTADOS_COPIA[copia.estado]
  const { emoji: emojiEnlace, mensaje: mensajeEnlace } =
    ESTADOS_ENLACE[enlace.estado]

  function copiarCodigo() {
    copia.copiar(codigo)
  }

  function compartir() {
    // no toca la URL actual: arma el enlace y lo copia
    enlace.copiar(crearEnlace(texto, estilos, window.location.href))
  }

  function descargar() {
    // documento completo: se puede abrir en el navegador sin esta app
    descargarHtml(generateDocumento(texto, estilos))
  }

  return (
    <section className='seccion'>
      <article className='salida-codigo'>
        <header>
          <div className='salida-codigo-titulo'>
            <h2 className='titulo'>Codigo</h2>
            <span className='codigo-lenguaje'>HTML + CSS</span>
          </div>
          <div className='salida-codigo-acciones'>
            <button type='button' onClick={descargar}>
              Descargar .html <span aria-hidden='true'>⤓</span>
            </button>
            <button type='button' onClick={compartir}>
              Compartir <span aria-hidden='true'>{emojiEnlace}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {mensajeEnlace}
              </span>
            </button>
            <button type='button' onClick={copiarCodigo}>
              Copiar <span aria-hidden='true'>{emoji}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {mensaje}
              </span>
            </button>
          </div>
        </header>

        <CodigoResaltado lineas={lineas} />
      </article>
    </section>
  )
}
