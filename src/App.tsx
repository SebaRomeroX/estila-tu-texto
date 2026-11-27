import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import './App.css'
import { StyleEditor } from './components/style_editor/StyleEditor'
import { Visualizador } from './components/Visualizador'
import { EstilosContext } from './context/estilosContext'
import { IdiomaContext } from './context/idiomaContext'
import { ESTILOS_POR_DEFECTO } from './lib/estilos'
import { IDIOMAS } from './lib/i18n'
import { decodificarEstado, limpiarHashCompartido } from './lib/compartir'
import {
  CLAVE_TEXTO,
  borrarDatos,
  cargarObjeto,
  guardarObjeto,
} from './lib/persistencia'
import { TEXTO_POR_DEFECTO } from './lib/texto'
import type { CampoTexto, Texto } from './types'

// el snippet vive debajo del preview: cargarlo en un chunk aparte saca del
// bundle inicial el resaltado y la generación de código
const SalidaCodigo = lazy(() =>
  import('./components/Salida').then((modulo) => ({
    default: modulo.SalidaCodigo,
  })),
)

const App = () => {
  const { aplicarEstilos, limpiarHistorial } = useContext(EstilosContext)
  const { idioma, cambiarIdioma, t } = useContext(IdiomaContext)
  const [mensajeBorrado, setMensajeBorrado] = useState('')

  // init lazy: un enlace compartido gana; si no hay, la sesión anterior (si
  // lo hay y es válido) gana sobre los defaults
  const [texto, setTexto] = useState<Texto>(
    () =>
      decodificarEstado(window.location.hash)?.texto ??
      cargarObjeto(CLAVE_TEXTO, TEXTO_POR_DEFECTO),
  )

  // el enlace compartido se aplica UNA vez: se limpia el hash para que las
  // ediciones posteriores no se pisen al recargar
  useEffect(() => {
    limpiarHashCompartido()
  }, [])

  // el texto se guarda en cada edición; el aviso de privacidad está en el
  // footer (se guarda solo en este navegador, no se envía a ningún lado)
  useEffect(() => {
    guardarObjeto(CLAVE_TEXTO, texto)
  }, [texto])

  function actualizarTexto(campo: CampoTexto, valor: string) {
    setTexto((prev) => ({ ...prev, [campo]: valor }))
  }

  function restablecerTexto() {
    setTexto({ ...TEXTO_POR_DEFECTO })
  }

  /**
   * Carga un texto completo (plantillas): reemplaza todos los campos de una.
   */
  function cargarTexto(nuevo: Texto) {
    setTexto({ ...nuevo })
  }

  // acción destructiva: pide confirmación antes de borrar nada
  function borrarDatosGuardados() {
    const confirmado = window.confirm(
      t(
        'Se borrarán tu texto y estilos guardados en este navegador. ¿Continuar?',
      ),
    )
    if (!confirmado) return

    borrarDatos()
    restablecerTexto()
    aplicarEstilos(ESTILOS_POR_DEFECTO)
    // el historial es de la sesión: si se borran los datos, no queda rastro
    limpiarHistorial()
    setMensajeBorrado(t('Datos guardados borrados'))
  }

  return (
    <div>
      <header className='header'>
        <h1 className='titulo header-titulo'>Estila tu Texto</h1>
        <label className='idioma-selector'>
          <span className='sr-only'>{t('Idioma')}</span>
          <select
            aria-label={t('Idioma')}
            value={idioma}
            onChange={(e) => cambiarIdioma(e.target.value)}
          >
            {IDIOMAS.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>
        <StyleEditor />
        <Visualizador
          actualizarTexto={actualizarTexto}
          texto={texto}
          restablecerTexto={restablecerTexto}
          cargarTexto={cargarTexto}
        />
        <Suspense
          fallback={
            <p className='salida-codigo cargando-codigo' role='status'>
              {t('Cargando código…')}
            </p>
          }
        >
          <SalidaCodigo texto={texto} />
        </Suspense>
      </main>
      <footer className='footer'>
        <p>
          {t('Hecho con ❤ por')}{' '}
          <a
            target='_blank'
            rel='noreferrer'
            href='https://sebaromerox.github.io/portafolios/'
          >
            Seba Romero
          </a>
        </p>
        <p className='nota-privacidad'>
          <span aria-hidden='true'>🔒 </span>
          {t(
            'Guardado local: tu texto y estilos se quedan en este navegador (localStorage); en un equipo compartido, quienes tengan acceso podrán verlos.',
          )}{' '}
          <button
            type='button'
            className='borrar-datos'
            onClick={borrarDatosGuardados}
          >
            {t('Borrar datos guardados')}
          </button>
          <span className='sr-only' role='status' aria-live='polite'>
            {mensajeBorrado}
          </span>
        </p>
        <p className='version-app'>v0.1.0</p>
      </footer>
    </div>
  )
}

export default App
