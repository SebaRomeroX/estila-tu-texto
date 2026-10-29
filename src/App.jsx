import { useState } from 'react'
import './App.css'
import { StyleEditor } from './components/style_editor/StyleEditor'
import { SalidaCodigo } from './components/Salida'
import { Visualizador } from './components/Visualizador'

const TEXTO_INICIAL = {
  titulo: 'Texto de Ejemplo',
  parrafo1: 'Esta es una vista previa de tus estilos.',
  parrafo2:
    'Puedes escribir lo que quieras aqui para ver como se aplican los estilos. Este va a ser un string mas largo para que se aprecie el salto de linea y la distancia entre ellas.',
  subtitulo: 'Pega un texto',
  parrafo3: 'Puedes copiar cualquien texto y pegarlo aqui, si prefieres.',
}

const App = () => {
  const [texto, setTexto] = useState(TEXTO_INICIAL)

  /**
   * @param {import('./types.js').CampoTexto} campo
   * @param {string} valor
   */
  function actualizarTexto(campo, valor) {
    setTexto((prev) => ({ ...prev, [campo]: valor }))
  }

  function restablecerTexto() {
    setTexto({ ...TEXTO_INICIAL })
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
      </footer>
    </div>
  )
}

export default App
