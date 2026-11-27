import { useContext, useMemo } from 'react'
import { EstilosContext } from '../context/estilosContext'
import { IdiomaContext } from '../context/idiomaContext'
import { crearEnlace } from '../lib/compartir'
import { descargarHtml } from '../lib/descargar'
import {
  generateCode,
  generateCss,
  generateDocumento,
  generateHtml,
} from '../lib/generateCode'
import { resaltarCodigo } from '../lib/resaltar'
import { CodigoResaltado } from './CodigoResaltado'
import { useCopiar } from './useCopiar'
import type { ParametrosSalida } from '../types'

interface EstadoCopia {
  emoji: string
  mensaje: string
}

// feedback del copiar: emoji para la vista, texto para lectores de pantalla
const ESTADOS_COPIA: Record<string, EstadoCopia> = {
  espera: { emoji: '📝', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'Código copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'Error al copiar el código' },
}

const ESTADOS_HTML: Record<string, EstadoCopia> = {
  espera: { emoji: '📝', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'HTML copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'Error al copiar el HTML' },
}

const ESTADOS_CSS: Record<string, EstadoCopia> = {
  espera: { emoji: '📝', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'CSS copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'Error al copiar el CSS' },
}

const ESTADOS_ENLACE: Record<string, EstadoCopia> = {
  espera: { emoji: '🔗', mensaje: '' },
  ok: { emoji: '✔', mensaje: 'Enlace copiado al portapapeles' },
  error: { emoji: '❗', mensaje: 'No se pudo copiar el enlace' },
}

export const SalidaCodigo = ({ texto }: ParametrosSalida) => {
  const { estilos } = useContext(EstilosContext)
  const { idioma, t } = useContext(IdiomaContext)
  const copia = useCopiar()
  const copiaHtml = useCopiar()
  const copiaCss = useCopiar()
  const enlace = useCopiar()

  // misma función para mostrar y para copiar → no pueden divergir
  const codigo = generateCode(texto, estilos, idioma)
  // el resaltado es solo de presentación: parte del mismo string
  const lineas = useMemo(() => resaltarCodigo(codigo), [codigo])
  const { emoji, mensaje } = ESTADOS_COPIA[copia.estado]
  const { emoji: emojiHtml, mensaje: mensajeHtml } =
    ESTADOS_HTML[copiaHtml.estado]
  const { emoji: emojiCss, mensaje: mensajeCss } = ESTADOS_CSS[copiaCss.estado]
  const { emoji: emojiEnlace, mensaje: mensajeEnlace } =
    ESTADOS_ENLACE[enlace.estado]

  function copiarCodigo() {
    copia.copiar(codigo)
  }

  function copiarHtml() {
    copiaHtml.copiar(generateHtml(texto, estilos, idioma))
  }

  function copiarCss() {
    copiaCss.copiar(generateCss(estilos))
  }

  function compartir() {
    // no toca la URL actual: arma el enlace y lo copia
    enlace.copiar(crearEnlace(texto, estilos, window.location.href))
  }

  function descargar() {
    // documento completo: se puede abrir en el navegador sin esta app
    descargarHtml(generateDocumento(texto, estilos, idioma))
  }

  return (
    <section className='seccion'>
      <article className='salida-codigo'>
        <header>
          <div className='salida-codigo-titulo'>
            <h2 className='titulo'>{t('Codigo')}</h2>
            <span className='codigo-lenguaje'>HTML + CSS</span>
          </div>
          <div className='salida-codigo-acciones'>
            <button type='button' onClick={descargar}>
              {t('Descargar .html')} <span aria-hidden='true'>⤓</span>
            </button>
            <button type='button' onClick={compartir}>
              {t('Compartir')} <span aria-hidden='true'>{emojiEnlace}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {t(mensajeEnlace)}
              </span>
            </button>
            <button
              type='button'
              aria-label={t('Copiar HTML')}
              onClick={copiarHtml}
            >
              HTML <span aria-hidden='true'>{emojiHtml}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {t(mensajeHtml)}
              </span>
            </button>
            <button
              type='button'
              aria-label={t('Copiar CSS')}
              onClick={copiarCss}
            >
              CSS <span aria-hidden='true'>{emojiCss}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {t(mensajeCss)}
              </span>
            </button>
            <button
              type='button'
              aria-label={t('Copiar HTML y CSS')}
              onClick={copiarCodigo}
            >
              {t('Copiar todo')} <span aria-hidden='true'>{emoji}</span>
              <span className='sr-only' role='status' aria-live='polite'>
                {t(mensaje)}
              </span>
            </button>
          </div>
        </header>

        <CodigoResaltado lineas={lineas} />
      </article>
    </section>
  )
}
