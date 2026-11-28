import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App'
import { EstilosProvider } from './context/EstilosProvider'
import { IdiomaProvider } from './context/IdiomaProvider'
import { codificarEstado, decodificarEstado } from './lib/compartir'
import { descargarImagen } from './lib/descargarImagen'
import { ESTILOS_POR_DEFECTO } from './lib/estilos'
import { CLAVE_IDIOMA } from './lib/i18n'
import { CLAVE_ESTILOS, CLAVE_PRESETS, CLAVE_TEXTO } from './lib/persistencia'
import { TEXTO_POR_DEFECTO } from './lib/texto'

// jsdom no puede rasterizar: el wrapper de html-to-image se mockea en la
// integración y se prueba aparte en descargarImagen.test.js
vi.mock('./lib/descargarImagen', () => ({ descargarImagen: vi.fn() }))

/** @type {HTMLElement} */
let container
/** @type {HTMLPreElement} */
let pre
/** @type {HTMLElement} */
let preview
/** @type {ReturnType<typeof render>} */
let app

// igual que en main.tsx: la app vive dentro del provider. El snippet se carga
// en un chunk aparte, así que hay que esperar a que Suspense lo resuelva.
async function renderApp() {
  app = render(
    <IdiomaProvider>
      <EstilosProvider>
        <App />
      </EstilosProvider>
    </IdiomaProvider>,
  )
  container = app.container
  preview = /** @type {HTMLElement} */ (
    container.querySelector('.visualizador')
  )
  await waitFor(() => {
    if (!container.querySelector('pre')) {
      throw new Error('el snippet todavía no se cargó')
    }
  })
  pre = /** @type {HTMLPreElement} */ (container.querySelector('pre'))
}

function elegirFuente(valor) {
  fireEvent.change(screen.getByLabelText('Fuente'), {
    target: { value: valor },
  })
}

function elegirTema(valor) {
  fireEvent.change(screen.getByLabelText('Temas:'), {
    target: { value: valor },
  })
}

beforeEach(async () => {
  vi.clearAllMocks()
  // idioma y datos guardados de un test no deben filtrarse al siguiente
  localStorage.clear()
  // cada test arranca sin enlace compartido en la URL
  window.history.replaceState(null, '', '/')
  // y sin un FontFaceSet falso de un test anterior
  Reflect.deleteProperty(document, 'fonts')
  // user-event reemplaza navigator.clipboard en su setup(): re-instalamos el
  // espía en cada test para no depender del orden
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  })

  await renderApp()
})

afterEach(() => {
  // el test de descarga define estos métodos (jsdom no los implementa)
  vi.restoreAllMocks()
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
})

describe('preview y snippet compartidos', () => {
  it('renderiza el texto por defecto en el preview y en el snippet', () => {
    expect(within(preview).getByText('Texto de Ejemplo')).toBeInTheDocument()
    expect(pre).toHaveTextContent('<h2>Texto de Ejemplo</h2>')
    expect(pre).toHaveTextContent('font-size: 1.2rem;')
  })

  it('cambiar el color actualiza el preview Y el snippet', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(pre).toHaveTextContent('color: #123456;')
  })

  it('cambiar la fuente actualiza el preview Y el snippet', () => {
    elegirFuente('Arial, Helvetica, sans-serif')

    expect(preview.style.fontFamily).toBe('Arial, Helvetica, sans-serif')
    expect(pre).toHaveTextContent('font-family: Arial, Helvetica, sans-serif;')
    expect(screen.getByLabelText('Fuente')).toHaveValue(
      'Arial, Helvetica, sans-serif',
    )
  })

  it('muestra las fuentes agrupadas y cada una con su tipografía', () => {
    const selector = screen.getByLabelText('Fuente')
    const grupos = Array.from(selector.querySelectorAll('optgroup')).map(
      (grupo) => grupo.label,
    )

    expect(grupos).toEqual([
      'Cargadas (siempre iguales)',
      'Del sistema (según tu equipo)',
      'Genéricas (siempre disponibles)',
    ])

    const roboto = within(selector).getByRole('option', { name: /^Roboto/ })
    expect(roboto.style.fontFamily).toBe('Roboto, sans-serif')
    expect(roboto).toHaveTextContent('cargada')

    // la fuente por defecto aparece seleccionada
    expect(selector).toHaveValue('system-ui')
  })

  it('una fuente web llega al preview y el snippet trae la hoja para replicarla', () => {
    elegirFuente('Roboto, sans-serif')

    expect(preview.style.fontFamily).toBe('Roboto, sans-serif')
    expect(pre).toHaveTextContent('font-family: Roboto, sans-serif;')
    expect(pre).toHaveTextContent(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap',
    )
  })

  it('avisa cuando la fuente del sistema no está instalada', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => false) },
    })

    elegirFuente('Georgia, serif')

    expect(screen.getByText(/«Georgia» no está instalada/i)).toBeInTheDocument()
  })

  it('no avisa si la fuente del sistema sí está instalada', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => true) },
    })

    elegirFuente('Georgia, serif')

    expect(screen.queryByText(/no está instalada/i)).not.toBeInTheDocument()
  })

  it('no avisa para fuentes web: se cargan solas', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => false) },
    })

    elegirFuente('Open Sans, sans-serif')

    expect(screen.queryByText(/no está instalada/i)).not.toBeInTheDocument()
  })

  it('avisa si las fuentes propias del título y subtítulo tampoco están instaladas', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => false) },
    })

    elegirFuente('Georgia, serif')
    fireEvent.change(screen.getByLabelText('Fuente título'), {
      target: { value: 'Garamond, serif' },
    })
    fireEvent.change(screen.getByLabelText('Fuente subtítulo'), {
      target: { value: 'Palatino, Palatino Linotype, serif' },
    })

    expect(
      screen.getByText(
        /«Georgia», «Garamond» y «Palatino» no están instaladas/i,
      ),
    ).toBeInTheDocument()
  })

  it('cambiar el tamaño numérico actualiza el preview Y el snippet', () => {
    fireEvent.change(screen.getByLabelText('Tamaño (rem)'), {
      target: { value: '1.5' },
    })

    expect(preview.style.fontSize).toBe('1.5rem')
    expect(pre).toHaveTextContent('font-size: 1.5rem;')
  })

  it('el ancho de línea y el line-height llegan al preview y al snippet', () => {
    // 65ch por defecto y line-height sin unidad
    expect(preview.style.maxWidth).toBe('65ch')
    expect(preview.style.lineHeight).toBe('1.4')
    expect(pre).toHaveTextContent('max-width: 65ch;')
    expect(pre).toHaveTextContent('line-height: 1.4;')
    expect(pre).not.toHaveTextContent('line-height: 1.4em;')

    fireEvent.change(screen.getByLabelText('Ancho linea (ch)'), {
      target: { value: '45' },
    })

    expect(preview.style.maxWidth).toBe('45ch')
    expect(pre).toHaveTextContent('max-width: 45ch;')
  })

  it('aplica mayúsculas, decoración y cursiva al preview y al snippet', () => {
    fireEvent.change(screen.getByLabelText('Mayusculas'), {
      target: { value: 'uppercase' },
    })
    expect(preview.style.textTransform).toBe('uppercase')
    expect(pre).toHaveTextContent('text-transform: uppercase;')

    fireEvent.change(screen.getByLabelText('Decoracion'), {
      target: { value: 'line-through' },
    })
    expect(preview.style.textDecoration).toBe('line-through')
    expect(pre).toHaveTextContent('text-decoration: line-through;')

    fireEvent.change(screen.getByLabelText('Estilo letra'), {
      target: { value: 'italic' },
    })
    expect(preview.style.fontStyle).toBe('italic')
    expect(pre).toHaveTextContent('font-style: italic;')
  })

  it('la escala del título llega al preview y al snippet', () => {
    // la variable CSS alimenta la regla .visualizador h2 del preview
    expect(preview.style.getPropertyValue('--escala-titulo')).toBe('1.5')
    expect(pre).toHaveTextContent('.texto h2 {')
    expect(pre).toHaveTextContent('font-size: 1.5em;')

    fireEvent.change(screen.getByLabelText('Tamaño titulo (%)'), {
      target: { value: '200' },
    })

    expect(preview.style.getPropertyValue('--escala-titulo')).toBe('2')
    expect(pre).toHaveTextContent('font-size: 2em;')
  })

  it('la sangría de primera línea solo afecta a los párrafos', () => {
    expect(preview.style.getPropertyValue('--sangria')).toBe('0em')
    expect(pre).toHaveTextContent('.texto p {')
    expect(pre).toHaveTextContent('text-indent: 0em;')

    fireEvent.change(screen.getByLabelText('Sangría primera línea (em)'), {
      target: { value: '1.5' },
    })

    expect(preview.style.getPropertyValue('--sangria')).toBe('1.5em')
    expect(pre).toHaveTextContent('text-indent: 1.5em;')
  })

  it('el espacio entre palabras llega al preview y al snippet', () => {
    fireEvent.change(screen.getByLabelText('Espacio palabras (em)'), {
      target: { value: '0.2' },
    })

    expect(preview.style.wordSpacing).toBe('0.2em')
    expect(pre).toHaveTextContent('word-spacing: 0.2em;')
  })

  it('las versalitas y el corte de línea llegan al preview y al snippet', () => {
    fireEvent.change(screen.getByLabelText('Versalitas'), {
      target: { value: 'small-caps' },
    })
    expect(preview.style.fontVariant).toBe('small-caps')
    expect(pre).toHaveTextContent('font-variant: small-caps;')

    fireEvent.change(screen.getByLabelText('Corte de línea'), {
      target: { value: 'balance' },
    })
    expect(pre).toHaveTextContent('text-wrap: balance;')
  })

  it('acepta tracking negativo y pesos altos', () => {
    fireEvent.change(screen.getByLabelText('Espacio letras'), {
      target: { value: '-0.05' },
    })
    expect(preview.style.letterSpacing).toBe('-0.05em')
    expect(pre).toHaveTextContent('letter-spacing: -0.05em;')

    fireEvent.change(screen.getByLabelText('Ancho letra'), {
      target: { value: '800' },
    })
    expect(preview.style.fontWeight).toBe('800')
    expect(pre).toHaveTextContent('font-weight: 800;')
  })

  it('el título "Vista previa" usa el mismo color que el texto', () => {
    const tituloVista = screen.getByRole('heading', { name: /vista previa/i })

    expect(tituloVista).toHaveStyle({ color: 'rgb(240, 248, 255)' }) // default

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    // mismo color que el preview: no se pierde contraste al cambiar el tema
    expect(tituloVista).toHaveStyle({ color: 'rgb(18, 52, 86)' })
  })
})

describe('contraste WCAG', () => {
  it('muestra el ratio y el nivel del par texto/fondo', () => {
    const indicador = screen.getByText(/contraste texto\/fondo/i).closest('p')

    // aliceblue sobre #020202: muy por encima de 7:1
    expect(indicador).toHaveTextContent('19.34')
    expect(indicador).toHaveTextContent('AAA')
  })

  it('avisa cuando el par elegido es ilegible', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#020202' },
    })

    const indicador = screen.getByText(/contraste texto\/fondo/i).closest('p')

    expect(indicador).toHaveTextContent('1.00:1')
    expect(indicador).toHaveTextContent('Insuficiente')
  })

  it('sigue al tema aplicado', () => {
    elegirTema('editorial')

    // #222 sobre #F7F3EC: 14.38:1
    const indicador = screen.getByText(/contraste texto\/fondo/i).closest('p')

    expect(indicador).toHaveTextContent('14.38')
  })
})

describe('validación de rangos de los inputs numéricos', () => {
  it('un campo vacío no rompe el snippet y se revierte al desenfocar', () => {
    const tamaño = screen.getByLabelText('Tamaño (rem)')
    fireEvent.change(tamaño, { target: { value: '1.5' } })

    fireEvent.change(tamaño, { target: { value: '' } })
    // el contexto nunca recibió el string vacío
    expect(pre).toHaveTextContent('font-size: 1.5rem;')

    fireEvent.blur(tamaño)
    expect(tamaño).toHaveValue(1.5)
    expect(pre).toHaveTextContent('font-size: 1.5rem;')
    expect(pre).not.toHaveTextContent('font-size: rem;')
  })

  it('un valor fuera de rango se clampa en el blur', () => {
    const tamaño = screen.getByLabelText('Tamaño (rem)') // min 1, max 2

    fireEvent.change(tamaño, { target: { value: '99' } })
    // fuera de rango: el contexto se mantiene en el último valor válido
    expect(pre).toHaveTextContent('font-size: 1.2rem;')

    fireEvent.blur(tamaño)
    expect(tamaño).toHaveValue(2)
    expect(pre).toHaveTextContent('font-size: 2rem;')
  })
})

describe('vista de editor de código', () => {
  it('numera las líneas sin incluirlas en el texto copiable', () => {
    const gutter = /** @type {HTMLElement} */ (
      container.querySelector('.codigo-lineas')
    )

    expect(gutter).toHaveAttribute('aria-hidden', 'true')
    expect(gutter.children).toHaveLength(pre.textContent.split('\n').length)
    // el <pre> contiene SOLO código: ni números ni adornos
    expect(pre.textContent.startsWith('<article')).toBe(true)
    expect(pre.textContent).toContain('\n  <h2>')
  })

  it('resalta etiquetas, selectores y propiedades con clases de token', () => {
    expect(pre.querySelector('.tok-etiqueta')).toHaveTextContent('article')
    expect(pre.querySelector('.tok-selector')).toHaveTextContent('.texto')
    expect(pre.querySelector('.tok-propiedad')).toHaveTextContent('color')
    expect(pre.querySelector('.tok-valor-css')).toHaveTextContent('#F0F8FF')
  })
})

describe('letra capitular', () => {
  it('aplica la clase al preview y emite la regla en el snippet', () => {
    const selector = screen.getByLabelText('Letra capitular')

    expect(preview.className).toBe('visualizador')
    expect(pre).not.toHaveTextContent('::first-letter')

    fireEvent.change(selector, { target: { value: 'primera' } })

    expect(preview).toHaveClass('visualizador-capitular')
    expect(pre).toHaveTextContent('.texto p:first-of-type::first-letter')
    expect(pre).toHaveTextContent('float: left;')
    expect(pre).toHaveTextContent('font-size: 3.2em;')
  })

  it('se puede desactivar y vuelve al estado sin regla', () => {
    const selector = screen.getByLabelText('Letra capitular')

    fireEvent.change(selector, { target: { value: 'primera' } })
    fireEvent.change(selector, { target: { value: 'none' } })

    expect(preview).not.toHaveClass('visualizador-capitular')
    expect(pre).not.toHaveTextContent('::first-letter')
  })
})

describe('opacidad del bloque', () => {
  it('aplica la opacidad en el preview y en el snippet', () => {
    expect(pre).not.toHaveTextContent('opacity:')

    fireEvent.change(screen.getByLabelText('Opacidad del bloque'), {
      target: { value: '0.55' },
    })

    expect(preview.style.opacity).toBe('0.55')
    expect(pre).toHaveTextContent('opacity: 0.55;')
  })
})

describe('borde del bloque', () => {
  it('muestra los controles y emite borde + radio solo cuando está activo', () => {
    expect(pre).not.toHaveTextContent('border-radius:')
    expect(screen.queryByLabelText('Ancho borde (px)')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Borde'), {
      target: { value: 'si' },
    })

    expect(screen.getByLabelText('Ancho borde (px)')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Ancho borde (px)'), {
      target: { value: '3' },
    })
    fireEvent.change(screen.getByLabelText('Radio del borde (px)'), {
      target: { value: '20' },
    })
    fireEvent.change(screen.getByLabelText('Color borde'), {
      target: { value: '#123456' },
    })

    expect(preview.style.border).toBe('3px solid rgb(18, 52, 86)')
    expect(preview.style.borderRadius).toBe('20px')
    expect(pre).toHaveTextContent('border: 3px solid #123456;')
    expect(pre).toHaveTextContent('border-radius: 20px;')
  })
})

describe('contorno de texto', () => {
  it('muestra los controles y emite el trazo solo cuando está activo', () => {
    expect(pre).not.toHaveTextContent('-webkit-text-stroke:')
    expect(
      screen.queryByLabelText('Ancho contorno (px)'),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Contorno de texto'), {
      target: { value: 'si' },
    })

    fireEvent.change(screen.getByLabelText('Ancho contorno (px)'), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByLabelText('Color contorno'), {
      target: { value: '#123456' },
    })

    expect(preview.style.getPropertyValue('-webkit-text-stroke')).toBe(
      '2px #123456',
    )
    expect(pre).toHaveTextContent('-webkit-text-stroke: 2px #123456;')
    expect(pre).toHaveTextContent('paint-order: stroke fill;')
  })
})

describe('tarjeta glass', () => {
  it('aplica fondo translúcido, desenfoque y borde en preview y snippet', () => {
    expect(pre).not.toHaveTextContent('backdrop-filter:')

    fireEvent.change(screen.getByLabelText('Tarjeta glass'), {
      target: { value: 'si' },
    })

    expect(preview.style.background).toContain('rgba(2, 2, 2, 0.55)')
    expect(preview.style.boxShadow).toContain('rgba(0, 0, 0, 0.35)')
    expect(pre).toHaveTextContent('backdrop-filter: blur(14px) saturate(140%);')
  })
})

describe('animación de entrada', () => {
  it('aplica la clase y emite los keyframes solo cuando está activa', () => {
    expect(preview).not.toHaveClass('visualizador-animacion')
    expect(pre).not.toHaveTextContent('@keyframes')

    fireEvent.change(screen.getByLabelText('Animación de entrada'), {
      target: { value: 'entrada' },
    })

    expect(preview).toHaveClass('visualizador-animacion')
    expect(pre).toHaveTextContent('@keyframes estila-texto-entrada')
    expect(pre).toHaveTextContent(
      'animation: estila-texto-entrada 0.6s ease-out both;',
    )
    expect(pre).toHaveTextContent('@media (prefers-reduced-motion: reduce)')
  })
})

describe('sombra de texto', () => {
  it('aplica la sombra en el preview y en el snippet', () => {
    expect(pre).not.toHaveTextContent('text-shadow')

    fireEvent.change(screen.getByLabelText('Sombra'), {
      target: { value: 'resplandor' },
    })

    expect(preview.style.textShadow).toContain('0.4em')
    expect(pre).toHaveTextContent('text-shadow: 0 0 0.4em currentColor;')
  })

  it('permite una sombra personalizada con desplazamiento, blur y color', () => {
    expect(screen.queryByLabelText('Sombra X (px)')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Sombra'), {
      target: { value: 'personalizada' },
    })

    fireEvent.change(screen.getByLabelText('Sombra X (px)'), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByLabelText('Sombra Y (px)'), {
      target: { value: '4' },
    })
    fireEvent.change(screen.getByLabelText('Difuminado sombra (px)'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByLabelText('Color sombra'), {
      target: { value: '#123456' },
    })

    expect(pre).toHaveTextContent('text-shadow: 2px 4px 8px #123456;')
  })
})

describe('color de selección', () => {
  it('solo emite ::selection y muestra los colores cuando está personalizada', () => {
    expect(pre).not.toHaveTextContent('::selection')
    expect(screen.queryByLabelText('Fondo selección')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Selección de texto'), {
      target: { value: 'personalizada' },
    })

    expect(preview).toHaveClass('visualizador-seleccion')
    expect(pre).toHaveTextContent('.texto ::selection')
    expect(pre).toHaveTextContent('background-color: #2F4F6F;')
    expect(pre).toHaveTextContent('color: #FFFFFF;')
    expect(screen.getByText('Contraste selección')).toBeInTheDocument()
  })

  it('actualiza la regla al cambiar los colores y la quita al desactivar', () => {
    const selector = screen.getByLabelText('Selección de texto')
    fireEvent.change(selector, { target: { value: 'personalizada' } })

    fireEvent.change(screen.getByLabelText('Fondo selección'), {
      target: { value: '#123456' },
    })
    fireEvent.change(screen.getByLabelText('Texto seleccionado'), {
      target: { value: '#abcdef' },
    })

    expect(pre).toHaveTextContent('background-color: #123456;')
    expect(pre).toHaveTextContent('color: #abcdef;')

    fireEvent.change(selector, { target: { value: 'none' } })

    expect(preview).not.toHaveClass('visualizador-seleccion')
    expect(pre).not.toHaveTextContent('::selection')
    expect(screen.queryByText('Contraste selección')).not.toBeInTheDocument()
  })
})

describe('degradado de texto', () => {
  it('solo agrega la clase, la variable y la regla cuando está activo', () => {
    expect(preview).not.toHaveClass('visualizador-degradado')
    expect(preview.style.getPropertyValue('--degradado')).toBe('')
    expect(pre).not.toHaveTextContent('linear-gradient')
    expect(screen.queryByLabelText('Degradado inicio')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Degradado de texto'), {
      target: { value: 'degradado' },
    })

    expect(preview).toHaveClass('visualizador-degradado')
    expect(preview.style.getPropertyValue('--degradado')).toBe(
      'linear-gradient(135deg, #F0F8FF, #2D5AAD)',
    )
    expect(pre).toHaveTextContent(
      'background-image: linear-gradient(135deg, #F0F8FF, #2D5AAD);',
    )
    expect(pre).toHaveTextContent('-webkit-background-clip: text;')
    expect(pre).toHaveTextContent('background-clip: text;')
    expect(pre).toHaveTextContent('-webkit-text-fill-color: transparent;')
    expect(pre).toHaveTextContent('color: transparent;')
    // el fondo del bloque no se toca
    expect(preview.style.background).toBe('rgb(2, 2, 2)')
    expect(screen.getByLabelText('Degradado inicio')).toHaveValue('#f0f8ff')
    expect(screen.getByLabelText('Degradado fin')).toHaveValue('#2d5aad')
  })

  it('actualiza los colores y los quita al desactivar', () => {
    const selector = screen.getByLabelText('Degradado de texto')
    fireEvent.change(selector, { target: { value: 'degradado' } })

    fireEvent.change(screen.getByLabelText('Degradado inicio'), {
      target: { value: '#000000' },
    })
    fireEvent.change(screen.getByLabelText('Degradado fin'), {
      target: { value: '#ffffff' },
    })

    expect(preview.style.getPropertyValue('--degradado')).toBe(
      'linear-gradient(135deg, #000000, #ffffff)',
    )
    expect(pre).toHaveTextContent(
      'background-image: linear-gradient(135deg, #000000, #ffffff);',
    )

    fireEvent.change(selector, { target: { value: 'none' } })

    expect(preview).not.toHaveClass('visualizador-degradado')
    expect(preview.style.getPropertyValue('--degradado')).toBe('')
    expect(pre).not.toHaveTextContent('linear-gradient')
    expect(screen.queryByLabelText('Degradado inicio')).not.toBeInTheDocument()
  })

  it('mantiene visible la selección cuando hay degradado', () => {
    fireEvent.change(screen.getByLabelText('Degradado de texto'), {
      target: { value: 'degradado' },
    })

    // sin selección propia, el snippet recupera el color del navegador
    expect(pre).toHaveTextContent('-webkit-text-fill-color: HighlightText;')

    fireEvent.change(screen.getByLabelText('Selección de texto'), {
      target: { value: 'personalizada' },
    })

    // con selección propia, el relleno usa el color elegido
    expect(pre).toHaveTextContent('-webkit-text-fill-color: #FFFFFF;')
    expect(pre).not.toHaveTextContent('HighlightText')
  })
})

describe('dos columnas', () => {
  it('solo activa la clase y la regla cuando se eligen dos', () => {
    expect(preview).not.toHaveClass('visualizador-columnas')
    expect(pre).not.toHaveTextContent('column-count')

    fireEvent.change(screen.getByLabelText('Columnas'), {
      target: { value: 'dos' },
    })

    expect(preview).toHaveClass('visualizador-columnas')
    expect(pre).toHaveTextContent('column-count: 2;')
    expect(pre).toHaveTextContent('column-gap: 2em;')
    expect(pre).toHaveTextContent('column-span: all;')

    fireEvent.change(screen.getByLabelText('Columnas'), {
      target: { value: 'una' },
    })

    expect(preview).not.toHaveClass('visualizador-columnas')
    expect(pre).not.toHaveTextContent('column-count')
  })
})

describe('estilos propios del título', () => {
  it('la fuente y el peso del título no tocan el cuerpo', () => {
    expect(preview.style.getPropertyValue('--titulo-familia')).toBe('')
    expect(preview.style.getPropertyValue('--titulo-peso')).toBe('')

    fireEvent.change(screen.getByLabelText('Fuente título'), {
      target: { value: 'Georgia, serif' },
    })
    fireEvent.change(screen.getByLabelText('Ancho título'), {
      target: { value: '900' },
    })

    expect(preview.style.getPropertyValue('--titulo-familia')).toBe(
      'Georgia, serif',
    )
    expect(preview.style.getPropertyValue('--titulo-peso')).toBe('900')
    // el bloque sigue con la tipografía del cuerpo
    expect(preview.style.fontFamily).toBe('system-ui')
    expect(preview.style.fontWeight).toBe('400')
    expect(pre).toHaveTextContent('font-family: Georgia, serif;')
    expect(pre).toHaveTextContent('font-weight: 900;')
  })

  it('el color propio del título se activa y se hereda al desactivarlo', () => {
    expect(preview.style.getPropertyValue('--titulo-color')).toBe('')
    expect(screen.queryByText('Contraste título')).not.toBeInTheDocument()

    const colorTitulo = screen.getByLabelText('Color título')
    expect(colorTitulo).toHaveValue(ESTILOS_POR_DEFECTO.color.toLowerCase())

    fireEvent.change(colorTitulo, { target: { value: '#123456' } })

    // elegir un color activa "Color propio título"
    expect(screen.getByLabelText('Color propio título')).toBeChecked()
    expect(preview.style.getPropertyValue('--titulo-color')).toBe('#123456')
    expect(pre).toHaveTextContent('color: #123456;')
    expect(screen.getByText('Contraste título')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Color propio título'))

    expect(preview.style.getPropertyValue('--titulo-color')).toBe('')
    expect(pre).not.toHaveTextContent('color: #123456;')
    expect(screen.queryByText('Contraste título')).not.toBeInTheDocument()
  })
})

describe('estilos propios del subtítulo', () => {
  it('la fuente, el peso y la escala no tocan el cuerpo', () => {
    expect(preview.style.getPropertyValue('--subtitulo-familia')).toBe('')
    expect(preview.style.getPropertyValue('--subtitulo-peso')).toBe('')
    expect(preview.style.getPropertyValue('--escala-subtitulo')).toBe('1.17')

    fireEvent.change(screen.getByLabelText('Fuente subtítulo'), {
      target: { value: 'Georgia, serif' },
    })
    fireEvent.change(screen.getByLabelText('Ancho subtítulo'), {
      target: { value: '700' },
    })
    fireEvent.change(screen.getByLabelText('Tamaño subtítulo (%)'), {
      target: { value: '140' },
    })

    expect(preview.style.getPropertyValue('--subtitulo-familia')).toBe(
      'Georgia, serif',
    )
    expect(preview.style.getPropertyValue('--subtitulo-peso')).toBe('700')
    expect(preview.style.getPropertyValue('--escala-subtitulo')).toBe('1.4')
    // el bloque sigue con la tipografía del cuerpo
    expect(preview.style.fontFamily).toBe('system-ui')
    expect(preview.style.fontWeight).toBe('400')
    expect(pre).toHaveTextContent('font-size: 1.4em;')
    expect(pre).toHaveTextContent('font-family: Georgia, serif;')
    expect(pre).toHaveTextContent('font-weight: 700;')
  })

  it('el color propio del subtítulo se activa y se hereda al desactivarlo', () => {
    expect(preview.style.getPropertyValue('--subtitulo-color')).toBe('')
    expect(screen.queryByText('Contraste subtítulo')).not.toBeInTheDocument()

    const colorSubtitulo = screen.getByLabelText('Color subtítulo')
    expect(colorSubtitulo).toHaveValue(ESTILOS_POR_DEFECTO.color.toLowerCase())

    fireEvent.change(colorSubtitulo, { target: { value: '#123456' } })

    expect(screen.getByLabelText('Color propio subtítulo')).toBeChecked()
    expect(preview.style.getPropertyValue('--subtitulo-color')).toBe('#123456')
    expect(pre).toHaveTextContent('color: #123456;')
    expect(screen.getByText('Contraste subtítulo')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Color propio subtítulo'))

    expect(preview.style.getPropertyValue('--subtitulo-color')).toBe('')
    expect(pre).not.toHaveTextContent('color: #123456;')
    expect(screen.queryByText('Contraste subtítulo')).not.toBeInTheDocument()
  })
})

describe('padding del bloque', () => {
  it('cambia el margen interno del preview y del snippet', () => {
    expect(preview.style.padding).toBe('30px 60px')

    fireEvent.change(screen.getByLabelText('Padding vertical (px)'), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText('Padding horizontal (px)'), {
      target: { value: '80' },
    })

    expect(preview.style.padding).toBe('50px 80px')
    expect(pre).toHaveTextContent('padding: 50px 80px;')
    expect(pre).not.toHaveTextContent('padding: 30px 60px;')
  })
})

describe('fondo transparente', () => {
  function elegirTransparente() {
    fireEvent.change(screen.getByLabelText('Fondo del bloque'), {
      target: { value: 'si' },
    })
  }

  it('quita el fondo del preview y muestra el tablero de referencia', () => {
    expect(preview.style.background).toBe('rgb(2, 2, 2)')
    expect(container.querySelector('.marco-transparente')).toBeNull()

    elegirTransparente()

    const transparente = /** @type {HTMLElement} */ (
      container.querySelector('.visualizador')
    )
    expect(transparente.style.background).toBe('')
    expect(transparente.parentElement).toHaveClass('marco-transparente')
    expect(pre).not.toHaveTextContent('background: #020202;')
    expect(
      screen.getByText(/solo se usa como referencia de contraste/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Contraste texto/fondo (referencia)'),
    ).toBeInTheDocument()
  })

  it('exporta la imagen sin fondo cuando es transparente', async () => {
    vi.mocked(descargarImagen).mockResolvedValue(undefined)
    elegirTransparente()

    fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }))

    await screen.findByText('Imagen descargada.')
    expect(descargarImagen).toHaveBeenCalledWith(
      container.querySelector('.visualizador'),
      '',
    )
  })

  it('la vista limpia conserva el tablero y el tema de la app', () => {
    elegirTransparente()
    fireEvent.click(screen.getByRole('button', { name: /vista limpia/i }))

    const dialogo = screen.getByRole('dialog', { name: 'Vista limpia' })
    expect(dialogo.querySelector('.marco-transparente')).not.toBeNull()
    expect(dialogo.style.background).toBe('var(--color-fondo)')
    expect(
      /** @type {HTMLElement} */ (dialogo.querySelector('.visualizador')).style
        .background,
    ).toBe('')
  })
})

describe('temas predefinidos', () => {
  it('aplicar un tema cambia el preview Y el snippet', () => {
    elegirTema('consola')

    expect(preview.style.color).toBe('rgb(121, 224, 139)') // #79E08B
    // CSSOM normaliza las familias con espacios: "Courier New"
    expect(preview.style.fontFamily).toBe('"Courier New", Courier, monospace')
    expect(pre).toHaveTextContent('color: #79E08B;')
    expect(pre).toHaveTextContent(
      'font-family: Courier New, Courier, monospace;',
    )
  })

  it('el tema Clásico repite exactamente los valores por defecto', () => {
    // cualquier tema y volver al clásico deja el estado idéntico al inicial
    elegirTema('impacto')
    elegirTema('clasico')

    expect(preview.style.color).toBe('rgb(240, 248, 255)') // #F0F8FF
    expect(preview.style.textAlign).toBe('left')
    expect(pre).toHaveTextContent('font-size: 1.2rem;')
  })

  it('restablecer estilos vuelve a los defaults tras editarlos', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    expect(pre).toHaveTextContent('color: #123456;')

    fireEvent.click(
      screen.getByRole('button', { name: /restablecer estilos/i }),
    )

    expect(preview.style.color).toBe('rgb(240, 248, 255)')
    expect(pre).toHaveTextContent('color: #F0F8FF;')
  })

  it('marca en el select el tema aplicado', () => {
    const temas = screen.getByLabelText('Temas:')

    // la app arranca con los defaults = tema Clásico
    expect(temas).toHaveValue('clasico')

    elegirTema('consola')

    expect(temas).toHaveValue('consola')
  })

  it('al editar a mano el select pasa a Personalizado', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(screen.getByLabelText('Temas:')).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Personalizado' })).toBeDisabled()
  })

  it('restablecer estilos vuelve a marcar Clásico', () => {
    elegirTema('impacto')
    fireEvent.click(
      screen.getByRole('button', { name: /restablecer estilos/i }),
    )

    expect(screen.getByLabelText('Temas:')).toHaveValue('clasico')
  })

  it('con un tema claro el encabezado del preview usa su color de texto', () => {
    elegirTema('editorial')

    expect(screen.getByRole('heading', { name: /vista previa/i })).toHaveStyle({
      color: 'rgb(34, 34, 34)',
    }) // #222222 sobre beige
  })
})

describe('deshacer y rehacer', () => {
  it('deshace y rehace un cambio de estilo', () => {
    const deshacer = screen.getByRole('button', { name: 'Deshacer' })
    const rehacer = screen.getByRole('button', { name: 'Rehacer' })

    expect(deshacer).toBeDisabled()
    expect(rehacer).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(deshacer).toBeEnabled()

    fireEvent.click(deshacer)
    expect(preview.style.color).toBe('rgb(240, 248, 255)')
    expect(rehacer).toBeEnabled()

    fireEvent.click(rehacer)
    expect(preview.style.color).toBe('rgb(18, 52, 86)')
  })

  it('funde cambios seguidos del mismo campo en una sola entrada', () => {
    const color = screen.getByLabelText('Color letra')

    fireEvent.change(color, { target: { value: '#111111' } })
    fireEvent.change(color, { target: { value: '#222222' } })
    expect(preview.style.color).toBe('rgb(34, 34, 34)')

    // el undo vuelve al valor anterior a la ráfaga, no al paso intermedio
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(preview.style.color).toBe('rgb(240, 248, 255)')
  })

  it('aplicar un tema también se puede deshacer', () => {
    elegirTema('editorial')
    expect(preview.style.fontFamily).toBe('Georgia, serif')

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(preview.style.fontFamily).toBe('system-ui')

    fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }))
    expect(preview.style.fontFamily).toBe('Georgia, serif')
  })

  it('responde a Ctrl+Z y Ctrl+Shift+Z fuera de campos editables', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(preview.style.color).toBe('rgb(240, 248, 255)')

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true })
    expect(preview.style.color).toBe('rgb(18, 52, 86)')
  })

  it('"Borrar datos guardados" reinicia deshacer y rehacer', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))

    fireEvent.click(
      screen.getByRole('button', { name: /borrar datos guardados/i }),
    )

    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Rehacer' })).toBeDisabled()
  })
})

describe('botones copiar', () => {
  it('copiar todo copia exactamente el string que muestra el snippet', async () => {
    // fireEvent en vez de user-event: setup() de user-event secuestra el
    // navigator.clipboard y rompería el espía
    fireEvent.click(screen.getByRole('button', { name: 'Copiar HTML y CSS' }))

    await screen.findByText('✔')
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(pre.textContent)
  })

  it('copiar HTML copia el artículo sin el bloque de estilos', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Copiar HTML' }))

    await screen.findByText('HTML copiado al portapapeles')
    const copiado = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]

    expect(copiado).toContain(`<article class='texto'>`)
    expect(copiado).toContain('<h2>Texto de Ejemplo</h2>')
    expect(copiado).not.toContain('<style>')
  })

  it('copiar CSS copia las reglas sin HTML ni etiquetas style', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Copiar CSS' }))

    await screen.findByText('CSS copiado al portapapeles')
    const copiado = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0]

    expect(copiado).toContain('.texto {')
    expect(copiado).toContain('font-family: system-ui;')
    expect(copiado).not.toContain('<style>')
    expect(copiado).not.toContain('<article')
  })

  it('feedbacka error si el clipboard falla', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error('denegado'),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copiar HTML y CSS' }))

    await screen.findByText('❗')
  })
})

describe('descargar .html', () => {
  it('descarga un documento completo con el texto y los estilos actuales', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:test'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: /descargar \.html/i }))

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = /** @type {Blob} */ (
      vi.mocked(URL.createObjectURL).mock.calls[0][0]
    )
    const documento = await blob.text()

    expect(documento.startsWith('<!doctype html>')).toBe(true)
    expect(documento).toContain('<h2>Texto de Ejemplo</h2>')
    expect(documento).toContain('color: #123456;')
    expect(documento).toContain('<style>')
    expect(click).toHaveBeenCalled()
  })
})

describe('descargar imagen', () => {
  it('captura el artículo con el fondo actual y anuncia el éxito', async () => {
    vi.mocked(descargarImagen).mockResolvedValue(undefined)

    fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }))

    await screen.findByText('Imagen descargada.')
    expect(descargarImagen).toHaveBeenCalledWith(
      preview,
      ESTILOS_POR_DEFECTO.background,
    )
  })

  it('deshabilita el botón mientras genera y avisa si falla', async () => {
    /** @type {(error: Error) => void} */
    let fallar = () => {}
    vi.mocked(descargarImagen).mockImplementation(
      () =>
        new Promise((_, reject) => {
          fallar = reject
        }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }))

    expect(screen.getByRole('button', { name: 'Generando…' })).toBeDisabled()
    expect(
      /** @type {HTMLElement} */ (container.querySelector('.estado-imagen')),
    ).toHaveTextContent('Generando imagen…')

    fallar(new Error('no se pudo'))

    await screen.findByText('No se pudo generar la imagen. Intentá de nuevo.')
    expect(
      screen.getByRole('button', { name: 'Descargar imagen' }),
    ).toBeEnabled()
  })
})

describe('vista limpia', () => {
  it('muestra solo el texto, sin campos editables, sobre los estilos actuales', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /vista limpia/i }))

    const dialogo = screen.getByRole('dialog', { name: 'Vista limpia' })
    expect(within(dialogo).getByText('Texto de Ejemplo')).toBeInTheDocument()
    expect(dialogo.querySelector('[contenteditable]')).toBeNull()
    expect(
      within(dialogo).queryByRole('button', { name: /plantilla/i }),
    ).toBeNull()
    // fondo y color del usuario, igual que el preview
    expect(dialogo.style.background).toBe('rgb(2, 2, 2)')
    expect(dialogo.style.color).toBe('rgb(18, 52, 86)')
    // el fondo de la página no scrollea mientras está abierta
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('Escape cierra y devuelve el foco y el scroll', () => {
    const abrir = screen.getByRole('button', { name: /vista limpia/i })
    abrir.focus()
    fireEvent.click(abrir)

    const dialogo = screen.getByRole('dialog', { name: 'Vista limpia' })
    const cerrar = within(dialogo).getByRole('button', {
      name: /cerrar vista limpia/i,
    })
    expect(cerrar).toHaveFocus()

    fireEvent.keyDown(dialogo, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(abrir).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('atrapa el Tab en el cierre y el botón también cierra', () => {
    const abrir = screen.getByRole('button', { name: /vista limpia/i })
    fireEvent.click(abrir)

    const dialogo = screen.getByRole('dialog', { name: 'Vista limpia' })
    const cerrar = within(dialogo).getByRole('button', {
      name: /cerrar vista limpia/i,
    })

    fireEvent.keyDown(dialogo, { key: 'Tab' })
    expect(cerrar).toHaveFocus()

    fireEvent.click(cerrar)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(abrir).toHaveFocus()
  })
})

describe('compartir por URL', () => {
  it('un enlace compartido gana sobre lo guardado y se limpia el hash', async () => {
    const texto = { ...TEXTO_POR_DEFECTO, titulo: 'Texto compartido' }
    const estilos = { ...ESTILOS_POR_DEFECTO, color: '#123456' }
    window.location.hash = `s=${codificarEstado(texto, estilos)}`

    app.unmount()
    await renderApp()

    expect(within(preview).getByText('Texto compartido')).toBeInTheDocument()
    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    // se aplica una sola vez: el hash no queda pegado en la URL
    expect(window.location.hash).toBe('')
  })

  it('el botón Compartir copia un enlace con el estado actual', async () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /compartir/i }))

    await screen.findByText('✔')
    const [enlace] = vi.mocked(navigator.clipboard.writeText).mock.calls[0]
    const estado = decodificarEstado(new URL(enlace).hash)
    if (!estado) throw new Error('el enlace compartido no se pudo decodificar')

    expect(estado.texto.titulo).toBe('Texto de Ejemplo')
    expect(estado.estilos.color).toBe('#123456')
    // compartir no navega ni ensucia el historial
    expect(window.location.hash).toBe('')
  })

  it('feedbacka error si no se puede copiar el enlace', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error('denegado'),
    )

    fireEvent.click(screen.getByRole('button', { name: /compartir/i }))

    await screen.findByText('❗')
  })
})

describe('accesibilidad', () => {
  it('no tiene NINGUNA violación de axe-core', async () => {
    const { violations } = await axe.run(container, {
      resultTypes: ['violations'],
      rules: {
        // el contraste de color necesita render real de un browser;
        // en jsdom no es fiable → queda para revisión manual/visual
        'color-contrast': { enabled: false },
      },
    })

    // aserción estricta: cero violaciones de cualquier impacto
    expect(
      violations.map((violacion) => `${violacion.impact}:${violacion.id}`),
    ).toEqual([])
  })

  it('la vista limpia tampoco introduce violaciones', async () => {
    fireEvent.click(screen.getByRole('button', { name: /vista limpia/i }))

    const { violations } = await axe.run(container, {
      resultTypes: ['violations'],
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(
      violations.map((violacion) => `${violacion.impact}:${violacion.id}`),
    ).toEqual([])
  })

  it('el fondo transparente tampoco introduce violaciones', async () => {
    fireEvent.change(screen.getByLabelText('Fondo del bloque'), {
      target: { value: 'si' },
    })
    fireEvent.click(screen.getByRole('button', { name: /vista limpia/i }))

    const { violations } = await axe.run(container, {
      resultTypes: ['violations'],
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(
      violations.map((violacion) => `${violacion.impact}:${violacion.id}`),
    ).toEqual([])
  })

  it('el degradado de texto tampoco introduce violaciones', async () => {
    fireEvent.change(screen.getByLabelText('Degradado de texto'), {
      target: { value: 'degradado' },
    })
    fireEvent.click(screen.getByRole('button', { name: /vista limpia/i }))

    const { violations } = await axe.run(container, {
      resultTypes: ['violations'],
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(
      violations.map((violacion) => `${violacion.impact}:${violacion.id}`),
    ).toEqual([])
  })
})

describe('botón restablecer texto', () => {
  it('restablece el texto en el preview Y en el snippet', async () => {
    const user = userEvent.setup()
    const h2 = within(preview).getByText('Texto de Ejemplo')

    // el usuario edita directamente en el preview
    h2.textContent = 'Editado a mano'
    fireEvent.input(h2)
    expect(pre).toHaveTextContent('Editado a mano')

    await user.click(screen.getByRole('button', { name: /restablecer texto/i }))

    expect(h2).toHaveTextContent('Texto de Ejemplo')
    expect(pre).toHaveTextContent('Texto de Ejemplo')
    expect(pre).not.toHaveTextContent('Editado a mano')
  })
})

describe('plantillas de texto', () => {
  it('carga una plantilla sin confirmar si el texto sigue siendo el de ejemplo', () => {
    const confirmar = vi.spyOn(window, 'confirm')

    fireEvent.change(screen.getByLabelText('Plantilla'), {
      target: { value: 'ensayo' },
    })

    expect(confirmar).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Plantilla')).toHaveValue('ensayo')
    expect(
      within(preview).getByText('Elogio de la lectura lenta'),
    ).toBeInTheDocument()
    expect(pre).toHaveTextContent('<h2>Elogio de la lectura lenta</h2>')
  })

  it('no reemplaza texto editado si se cancela la confirmación', () => {
    const h2 = within(preview).getByText('Texto de Ejemplo')
    h2.textContent = 'Mi texto'
    fireEvent.input(h2)
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)

    fireEvent.change(screen.getByLabelText('Plantilla'), {
      target: { value: 'cuento' },
    })

    expect(confirmar).toHaveBeenCalledTimes(1)
    expect(pre).toHaveTextContent('Mi texto')
    expect(pre).not.toHaveTextContent('La casa junto al mar')
    // el select vuelve al placeholder porque el texto no coincide con ninguna
    expect(screen.getByLabelText('Plantilla')).toHaveValue('')
  })

  it('reemplaza y persiste el texto si se confirma', () => {
    const h2 = within(preview).getByText('Texto de Ejemplo')
    h2.textContent = 'Mi texto'
    fireEvent.input(h2)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.change(screen.getByLabelText('Plantilla'), {
      target: { value: 'carta' },
    })

    expect(
      within(preview).getByText('Carta a quien empieza'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Plantilla')).toHaveValue('carta')
    expect(JSON.parse(localStorage.getItem(CLAVE_TEXTO) ?? '{}')).toMatchObject(
      { titulo: 'Carta a quien empieza' },
    )
  })
})

describe('temas propios', () => {
  /**
   * @param {string} nombre
   */
  function guardarTema(nombre) {
    fireEvent.change(screen.getByLabelText('Guardar tema actual'), {
      target: { value: nombre },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tema' }))
  }

  it('guarda el tema actual con nombre y lo persiste', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    guardarTema('Mi tema')

    expect(
      screen.getByRole('button', { name: 'Aplicar tema propio Mi tema' }),
    ).toBeInTheDocument()
    const guardados = JSON.parse(
      /** @type {string} */ (localStorage.getItem(CLAVE_PRESETS)),
    )
    expect(guardados).toHaveLength(1)
    expect(guardados[0].nombre).toBe('Mi tema')
    expect(guardados[0].estilos.color).toBe('#123456')
    // el formulario pasa al siguiente nombre sugerido y anuncia el guardado
    expect(screen.getByLabelText('Guardar tema actual')).toHaveValue(
      '2. #123456 / #020202 · system-ui · 1.2em',
    )
    expect(screen.getByText('Tema «Mi tema» guardado')).toBeInTheDocument()
  })

  it('aplica un tema propio y lo marca como activo', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    guardarTema('Mi tema')
    // edición a mano: deja de coincidir con el tema guardado
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#654321' },
    })

    expect(
      screen.getByRole('button', { name: 'Aplicar tema propio Mi tema' }),
    ).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(
      screen.getByRole('button', { name: 'Aplicar tema propio Mi tema' }),
    )

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(
      screen.getByRole('button', { name: 'Aplicar tema propio Mi tema' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('elimina un tema propio del estado y del storage', () => {
    guardarTema('Mi tema')

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar tema propio Mi tema' }),
    )

    expect(
      screen.queryByRole('button', { name: 'Aplicar tema propio Mi tema' }),
    ).not.toBeInTheDocument()
    expect(localStorage.getItem(CLAVE_PRESETS)).toBe('[]')
    expect(screen.getByText('Tema «Mi tema» eliminado')).toBeInTheDocument()
  })

  it('los temas propios sobreviven a un remount', async () => {
    guardarTema('Persistente')

    app.unmount()
    await renderApp()

    expect(
      screen.getByRole('button', { name: 'Aplicar tema propio Persistente' }),
    ).toBeInTheDocument()
  })

  it('al hacer click en el nombre se selecciona entero para reemplazarlo', () => {
    const campo = screen.getByLabelText('Guardar tema actual')

    fireEvent.click(campo)

    expect(campo.selectionStart).toBe(0)
    expect(campo.selectionEnd).toBe(campo.value.length)
  })

  it('propone un nombre con el resumen y el número del tema', () => {
    const campo = screen.getByLabelText('Guardar tema actual')

    expect(campo).toHaveValue('1. #F0F8FF / #020202 · system-ui · 1.2em')

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(campo).toHaveValue('1. #123456 / #020202 · system-ui · 1.2em')
  })

  it('el nombre propio reemplaza la sugerencia y no se pisa al editar', () => {
    const campo = screen.getByLabelText('Guardar tema actual')
    fireEvent.change(campo, { target: { value: 'Oscuro' } })

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(campo).toHaveValue('Oscuro')
  })

  it('numera los temas guardados aunque tengan nombre propio', () => {
    guardarTema('Oscuro')
    expect(screen.getByLabelText('Guardar tema actual')).toHaveValue(
      '2. #F0F8FF / #020202 · system-ui · 1.2em',
    )

    guardarTema('Claro')
    expect(screen.getByLabelText('Guardar tema actual')).toHaveValue(
      '3. #F0F8FF / #020202 · system-ui · 1.2em',
    )
  })

  it('guarda con el nombre sugerido sin escribirlo', () => {
    fireEvent.click(screen.getByRole('button', { name: 'Guardar tema' }))

    expect(
      screen.getByRole('button', {
        name: 'Aplicar tema propio 1. #F0F8FF / #020202 · system-ui · 1.2em',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Guardar tema actual')).toHaveValue(
      '2. #F0F8FF / #020202 · system-ui · 1.2em',
    )
  })

  it('no deja guardar sin nombre', () => {
    const boton = screen.getByRole('button', { name: 'Guardar tema' })

    expect(boton).toBeEnabled()

    fireEvent.change(screen.getByLabelText('Guardar tema actual'), {
      target: { value: '   ' },
    })

    expect(boton).toBeDisabled()
  })

  it('"Borrar datos guardados" también elimina los temas propios', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    guardarTema('Se va')

    fireEvent.click(
      screen.getByRole('button', { name: /borrar datos guardados/i }),
    )

    expect(
      screen.queryByRole('button', { name: 'Aplicar tema propio Se va' }),
    ).not.toBeInTheDocument()
    expect(localStorage.getItem(CLAVE_PRESETS)).toBeNull()
  })
})

describe('idioma de la interfaz', () => {
  it('cambia textos, labels, lang y persiste la elección', () => {
    fireEvent.change(screen.getByLabelText('Idioma'), {
      target: { value: 'en' },
    })

    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Text color')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()

    const fuentes = screen.getByLabelText('Font')
    const grupos = Array.from(fuentes.querySelectorAll('optgroup')).map(
      (grupo) => grupo.label,
    )
    expect(grupos).toEqual([
      'Loaded (always the same)',
      'System (depending on your device)',
      'Generic (always available)',
    ])
    expect(
      within(fuentes).getByRole('option', { name: 'Serif (generic)' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Title font')).getByRole('option', {
        name: 'same as body',
      }),
    ).toBeInTheDocument()

    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem(CLAVE_IDIOMA)).toBe('en')

    fireEvent.change(screen.getByLabelText('Language'), {
      target: { value: 'es' },
    })

    expect(
      screen.getByRole('heading', { name: 'Vista previa' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Configuracion')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('es')
    expect(localStorage.getItem(CLAVE_IDIOMA)).toBe('es')
  })

  it('arranca en el idioma guardado en el navegador', async () => {
    localStorage.setItem(CLAVE_IDIOMA, 'en')
    app.unmount()
    await renderApp()

    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByLabelText('Block opacity')).toBeInTheDocument()
  })
})

describe('persistencia en localStorage', () => {
  it('los estilos sobreviven a un remount', async () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    app.unmount()
    await renderApp()

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(pre).toHaveTextContent('color: #123456;')
  })

  it('el texto editado sobrevive a un remount', async () => {
    const h2 = within(preview).getByText('Texto de Ejemplo')
    h2.textContent = 'Texto persistido'
    fireEvent.input(h2)

    app.unmount()
    await renderApp()

    expect(within(preview).getByText('Texto persistido')).toBeInTheDocument()
    expect(pre).toHaveTextContent('Texto persistido')
  })

  it('datos corruptos en el storage no rompen la app', async () => {
    localStorage.setItem(CLAVE_ESTILOS, '{roto')
    localStorage.setItem(CLAVE_TEXTO, '{roto')

    app.unmount()
    await renderApp()

    expect(preview.style.color).toBe('rgb(240, 248, 255)') // default
    expect(within(preview).getByText('Texto de Ejemplo')).toBeInTheDocument()
  })

  it('muestra el aviso de guardado local (info sensible)', () => {
    expect(screen.getByText(/guardado local/i)).toBeInTheDocument()
  })
})

describe('borrar datos guardados', () => {
  it('con confirmación: vuelve a defaults y no queda nada personal', () => {
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    const h2 = within(preview).getByText('Texto de Ejemplo')
    h2.textContent = 'Dato sensible'
    fireEvent.input(h2)

    fireEvent.click(
      screen.getByRole('button', { name: /borrar datos guardados/i }),
    )

    expect(confirmar).toHaveBeenCalledTimes(1)
    // UI de vuelta a los defaults
    expect(preview.style.color).toBe('rgb(240, 248, 255)')
    expect(within(preview).getByText('Texto de Ejemplo')).toBeInTheDocument()
    expect(within(preview).queryByText('Dato sensible')).not.toBeInTheDocument()
    // y lo persistido ya no contiene datos personales
    expect(JSON.parse(localStorage.getItem(CLAVE_ESTILOS) ?? '{}').color).toBe(
      '#F0F8FF',
    )
    expect(JSON.parse(localStorage.getItem(CLAVE_TEXTO) ?? '{}').titulo).toBe(
      'Texto de Ejemplo',
    )
    // feedback para lectores de pantalla
    expect(screen.getByText(/datos guardados borrados/i)).toBeInTheDocument()
  })

  it('sin confirmación no cambia nada', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /borrar datos guardados/i }),
    )

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(JSON.parse(localStorage.getItem(CLAVE_ESTILOS) ?? '{}').color).toBe(
      '#123456',
    )
  })
})
