import { useContext, useEffect, useRef, useState } from 'react'
import { EstilosContext } from '../context/estilosContext'
import { IdiomaContext } from '../context/idiomaContext'
import { descargarImagen } from '../lib/descargarImagen'
import { estilosToPreviewStyle } from '../lib/estilos'
import { PLANTILLAS, plantillaActiva } from '../lib/plantillas'
import { TEXTO_POR_DEFECTO } from '../lib/texto'
import { EditableText } from './EditableText'
import type { CampoTexto, ParametrosVisualizador, Texto } from '../types'
import type { ElementType, KeyboardEvent, ReactNode } from 'react'

interface CampoPreview {
  campo: CampoTexto
  etiqueta: string
  nombre: string
}

// estructura del preview: qué campo edita, con qué etiqueta HTML y cómo
// nombra ese campo para lectores de pantalla
const CAMPOS: CampoPreview[] = [
  { campo: 'titulo', etiqueta: 'h2', nombre: 'Título' },
  { campo: 'parrafo1', etiqueta: 'p', nombre: 'Párrafo 1' },
  { campo: 'parrafo2', etiqueta: 'p', nombre: 'Párrafo 2' },
  { campo: 'subtitulo', etiqueta: 'h3', nombre: 'Subtítulo' },
  { campo: 'parrafo3', etiqueta: 'p', nombre: 'Párrafo 3' },
]

interface ParametrosContenidoTexto {
  texto: Texto
}

/**
 * Texto no editable para la vista limpia: los mismos campos y etiquetas que el
 * preview, pero sin contentEditable ni nombres accesibles de campo.
 */
const ContenidoTexto = ({ texto }: ParametrosContenidoTexto) => (
  <>
    {CAMPOS.map(({ campo, etiqueta }) => {
      const Tag = etiqueta as ElementType
      return <Tag key={campo}>{texto[campo]}</Tag>
    })}
  </>
)

interface ParametrosMarco {
  transparente: boolean
  children: ReactNode
}

/**
 * Tablero de referencia detrás del artículo cuando el fondo es transparente.
 * Va fuera del article a propósito: la exportación captura solo el artículo,
 * así que el PNG conserva la transparencia y el tablero no se cuela.
 */
const Marco = ({ transparente, children }: ParametrosMarco) =>
  transparente ? (
    <div className='marco-transparente'>{children}</div>
  ) : (
    <>{children}</>
  )

export const Visualizador = ({
  texto,
  actualizarTexto,
  restablecerTexto,
  cargarTexto,
}: ParametrosVisualizador) => {
  const { estilos } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  const conCapitular = estilos.letraCapitular === 'primera'
  const conSeleccion = estilos.seleccion === 'personalizada'
  const conFondoTransparente = estilos.fondoTransparente === 'si'
  const conDegradado = estilos.degradado === 'degradado'
  const conColumnas = estilos.columnas === 'dos'
  const conAnimacion = estilos.animacion === 'entrada'
  const activa = plantillaActiva(texto)
  const articuloRef = useRef<HTMLElement | null>(null)
  const [estadoImagen, setEstadoImagen] = useState('idle')
  const [vistaLimpia, setVistaLimpia] = useState(false)
  const botonVistaRef = useRef<HTMLButtonElement | null>(null)
  const cerrarVistaRef = useRef<HTMLButtonElement | null>(null)
  const clasesVisualizador =
    'visualizador' +
    (conCapitular ? ' visualizador-capitular' : '') +
    (conSeleccion ? ' visualizador-seleccion' : '') +
    (conDegradado ? ' visualizador-degradado' : '') +
    (conColumnas ? ' visualizador-columnas' : '') +
    (conAnimacion ? ' visualizador-animacion' : '')

  // la vista limpia bloquea el scroll de la página, lleva el foco al cierre y
  // lo devuelve al botón que la abrió al salir (Escape o "Cerrar")
  useEffect(() => {
    if (!vistaLimpia) return

    const overflowPrevio = document.body.style.overflow
    const botonQueAbrio = botonVistaRef.current
    document.body.style.overflow = 'hidden'
    cerrarVistaRef.current?.focus()

    return () => {
      document.body.style.overflow = overflowPrevio
      botonQueAbrio?.focus()
    }
  }, [vistaLimpia])

  /**
   * Con un solo control enfocable, el Tab se queda en el cierre: es un foco
   * atrapado real y no depende de que el navegador entienda aria-modal.
   */
  function manejarTeclaVistaLimpia(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setVistaLimpia(false)
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      cerrarVistaRef.current?.focus()
    }
  }

  /**
   * Captura el artículo tal como se ve (fondo y estilos incluidos) y dispara
   * la descarga. El estado alimenta el role="status" para lectores de pantalla.
   */
  async function descargarVista() {
    if (!articuloRef.current) return

    setEstadoImagen('generando')
    try {
      // sin fondo el PNG sale transparente: el tablero del preview es solo
      // una referencia visual y no debe terminar en la imagen
      await descargarImagen(
        articuloRef.current,
        conFondoTransparente ? '' : estilos.background,
      )
      setEstadoImagen('listo')
    } catch {
      setEstadoImagen('error')
    }
  }

  /**
   * Aplica una plantilla. No pisa texto editado sin confirmación; si el texto
   * ya es el de la plantilla, no hace nada (evita un confirm inútil).
   */
  function aplicarPlantilla(id: string) {
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
        t(
          'Se reemplazará el texto actual por la plantilla "{nombre}". ¿Continuar?',
          {
            nombre: plantilla.nombre,
          },
        ),
      )
    ) {
      return
    }

    cargarTexto(plantilla.texto)
  }

  return (
    // el encabezado del preview vive sobre el fondo del usuario: debe usar
    // también SU color de texto, si no pierde contraste (ej. tema Editorial:
    // aliceblue sobre beige). La tipografía del header no se toca. Con fondo
    // transparente no hay color de fondo propio: el header vuelve al tema de
    // la app para no quedar sobre el tablero.
    <section
      style={
        conFondoTransparente
          ? undefined
          : { background: estilos.background, color: estilos.color }
      }
    >
      <div className='seccion'>
        <div className='visualizador-header'>
          <h2 className='titulo'>{t('Vista previa')}</h2>
          <div className='visualizador-acciones'>
            <span className='plantilla-selector'>
              <label htmlFor='plantilla-texto'>{t('Plantilla')}</label>
              <select
                id='plantilla-texto'
                value={activa ?? ''}
                onChange={(e) => aplicarPlantilla(e.target.value)}
              >
                <option value=''>{t('Elegir plantilla…')}</option>
                {PLANTILLAS.map((plantilla) => (
                  <option key={plantilla.id} value={plantilla.id}>
                    {t(plantilla.nombre)}
                  </option>
                ))}
              </select>
            </span>
            <button
              type='button'
              onClick={descargarVista}
              disabled={estadoImagen === 'generando'}
            >
              {estadoImagen === 'generando'
                ? t('Generando…')
                : t('Descargar imagen')}
            </button>
            <button
              type='button'
              ref={botonVistaRef}
              onClick={() => setVistaLimpia(true)}
            >
              {t('Vista limpia')} <span aria-hidden='true'>⛶</span>
            </button>
            <button type='button' onClick={restablecerTexto}>
              {t('Restablecer texto')} ↺
            </button>
            <p className='estado-imagen' role='status'>
              {estadoImagen === 'generando' && t('Generando imagen…')}
              {estadoImagen === 'listo' && t('Imagen descargada.')}
              {estadoImagen === 'error' &&
                t('No se pudo generar la imagen. Intentá de nuevo.')}
            </p>
          </div>
        </div>

        <Marco transparente={conFondoTransparente}>
          <article
            ref={articuloRef}
            className={clasesVisualizador}
            spellCheck='false'
            style={estilosToPreviewStyle(estilos)}
          >
            {CAMPOS.map(({ campo, etiqueta, nombre }) => (
              <EditableText
                key={campo}
                etiqueta={etiqueta}
                nombre={t(nombre)}
                valor={texto[campo]}
                onCambio={(valor) => actualizarTexto(campo, valor)}
              />
            ))}
          </article>
        </Marco>
      </div>

      {vistaLimpia && (
        <div
          className='vista-limpia'
          role='dialog'
          aria-modal='true'
          aria-label={t('Vista limpia')}
          style={
            conFondoTransparente
              ? {
                  background: 'var(--color-fondo)',
                  color: 'var(--color-texto)',
                }
              : { background: estilos.background, color: estilos.color }
          }
          onKeyDown={manejarTeclaVistaLimpia}
        >
          <button
            type='button'
            ref={cerrarVistaRef}
            className='vista-limpia-cerrar'
            onClick={() => setVistaLimpia(false)}
          >
            {t('Cerrar vista limpia')} <span aria-hidden='true'>✕</span>
          </button>
          <Marco transparente={conFondoTransparente}>
            <article
              className={clasesVisualizador}
              spellCheck='false'
              style={estilosToPreviewStyle(estilos)}
            >
              <ContenidoTexto texto={texto} />
            </article>
          </Marco>
        </div>
      )}
    </section>
  )
}
