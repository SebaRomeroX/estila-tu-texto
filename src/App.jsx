import { useContext, useEffect, useState } from 'react'
import './App.css'
import { StyleEditor } from './components/style_editor/StyleEditor'
import { SalidaCodigo } from './components/Salida'
import { Visualizador } from './components/Visualizador'
import { EstilosContext } from './context/estilosContext.js'
import { ESTILOS_POR_DEFECTO } from './lib/estilos.js'
import { decodificarEstado, limpiarHashCompartido } from './lib/compartir.js'
import {
  CLAVE_TEXTO,
  borrarDatos,
  cargarObjeto,
  guardarObjeto,
} from './lib/persistencia.js'
import { TEXTO_POR_DEFECTO } from './lib/texto.js'

const App = () => {
  const { aplicarEstilos } = useContext(EstilosContext)
  const [mensajeBorrado, setMensajeBorrado] = useState('')

  // init lazy: un enlace compartido gana; si no hay, la sesión anterior (si
  // lo hay y es válido) gana sobre los defaults
  const [texto, setTexto] = useState(
    () =>
      /** @type {import('./types.js').Texto} */ (
        decodificarEstado(window.location.hash)?.texto ??
          cargarObjeto(CLAVE_TEXTO, TEXTO_POR_DEFECTO)
      ),
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

  /**
   * @param {import('./types.js').CampoTexto} campo
   * @param {string} valor
   */
  function actualizarTexto(campo, valor) {
    setTexto((prev) => ({ ...prev, [campo]: valor }))
  }

  function restablecerTexto() {
    setTexto({ ...TEXTO_POR_DEFECTO })
  }

  // acción destructiva: pide confirmación antes de borrar nada
  function borrarDatosGuardados() {
    const confirmado = window.confirm(
      'Se borrarán tu texto y estilos guardados en este navegador. ¿Continuar?',
    )
    if (!confirmado) return

    borrarDatos()
    restablecerTexto()
    aplicarEstilos(ESTILOS_POR_DEFECTO)
    setMensajeBorrado('Datos guardados borrados')
  }

  return (
    <div>
      <header className='header'>
        <h1 className='titulo seccion'>Estila tu Texto</h1>
      </header>
      <main>
        <StyleEditor />
        <Visualizador
          actualizarTexto={actualizarTexto}
          texto={texto}
          restablecerTexto={restablecerTexto}
        />
        <SalidaCodigo texto={texto} />
      </main>
      <footer className='footer'>
        <p>
          Hecho con ❤ por{' '}
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
          Guardado local: tu texto y estilos se quedan en este navegador
          (localStorage); en un equipo compartido, quienes tengan acceso podrán
          verlos.{' '}
          <button
            type='button'
            className='borrar-datos'
            onClick={borrarDatosGuardados}
          >
            Borrar datos guardados
          </button>
          <span className='sr-only' role='status' aria-live='polite'>
            {mensajeBorrado}
          </span>
        </p>
      </footer>
    </div>
  )
}

export default App
