import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App.jsx'
import { EstilosProvider } from './context/EstilosProvider.jsx'
import { codificarEstado, decodificarEstado } from './lib/compartir.js'
import { ESTILOS_POR_DEFECTO } from './lib/estilos.js'
import { CLAVE_ESTILOS, CLAVE_TEXTO } from './lib/persistencia.js'
import { TEXTO_POR_DEFECTO } from './lib/texto.js'

/** @type {HTMLElement} */
let container
/** @type {HTMLPreElement} */
let pre
/** @type {HTMLElement} */
let preview
/** @type {ReturnType<typeof render>} */
let app

// igual que en main.jsx: la app vive dentro del provider
function renderApp() {
  app = render(
    <EstilosProvider>
      <App />
    </EstilosProvider>,
  )
  container = app.container
  pre = container.querySelector('pre')
  preview = container.querySelector('.visualizador')
}

beforeEach(() => {
  vi.clearAllMocks()
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

  renderApp()
})

describe('preview y snippet compartidos', () => {
  it('renderiza el texto por defecto en el preview y en el snippet', () => {
    expect(within(preview).getByText('Texto de Ejemplo')).toBeInTheDocument()
    expect(pre).toHaveTextContent('<h2>Texto de Ejemplo</h2>')
    expect(pre).toHaveTextContent('font-size: 1.2em;')
  })

  it('cambiar el color actualiza el preview Y el snippet', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(pre).toHaveTextContent('color: #123456;')
  })

  it('cambiar la fuente actualiza el preview Y el snippet', () => {
    fireEvent.click(screen.getByRole('button', { name: /^Arial/ }))

    expect(preview.style.fontFamily).toBe('Arial, Helvetica, sans-serif')
    expect(pre).toHaveTextContent('font-family: Arial, Helvetica, sans-serif;')
    expect(screen.getByRole('button', { name: /^Arial/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('muestra las fuentes agrupadas y cada una con su tipografía', () => {
    const grupos = screen
      .getAllByRole('heading', { level: 4 })
      .map((titulo) => titulo.textContent)

    expect(grupos).toEqual([
      'Cargadas (siempre iguales)',
      'Del sistema (según tu equipo)',
      'Genéricas (siempre disponibles)',
    ])

    const roboto = screen.getByRole('button', { name: /^Roboto/ })
    expect(roboto.style.fontFamily).toBe('Roboto, sans-serif')
    expect(roboto).toHaveTextContent('cargada')

    // la fuente por defecto aparece marcada
    expect(screen.getByRole('button', { name: /^System UI/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('una fuente web llega al preview y el snippet trae la hoja para replicarla', () => {
    fireEvent.click(screen.getByRole('button', { name: /^Roboto/ }))

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

    fireEvent.click(screen.getByRole('button', { name: /^Georgia/ }))

    expect(screen.getByText(/«Georgia» no está instalada/i)).toBeInTheDocument()
  })

  it('no avisa si la fuente del sistema sí está instalada', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => true) },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Georgia/ }))

    expect(screen.queryByText(/no está instalada/i)).not.toBeInTheDocument()
  })

  it('no avisa para fuentes web: se cargan solas', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { check: vi.fn(() => false) },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Open Sans/ }))

    expect(screen.queryByText(/no está instalada/i)).not.toBeInTheDocument()
  })

  it('cambiar el tamaño numérico actualiza el preview Y el snippet', () => {
    fireEvent.change(screen.getByLabelText('Tamaño'), {
      target: { value: '1.5' },
    })

    expect(preview.style.fontSize).toBe('1.5em')
    expect(pre).toHaveTextContent('font-size: 1.5em;')
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
    fireEvent.click(screen.getByRole('button', { name: /tema Editorial/i }))

    // #222 sobre #F7F3EC: 14.38:1
    const indicador = screen.getByText(/contraste texto\/fondo/i).closest('p')

    expect(indicador).toHaveTextContent('14.38')
  })
})

describe('validación de rangos de los inputs numéricos', () => {
  it('un campo vacío no rompe el snippet y se revierte al desenfocar', () => {
    const tamaño = screen.getByLabelText('Tamaño')
    fireEvent.change(tamaño, { target: { value: '1.5' } })

    fireEvent.change(tamaño, { target: { value: '' } })
    // el contexto nunca recibió el string vacío
    expect(pre).toHaveTextContent('font-size: 1.5em;')

    fireEvent.blur(tamaño)
    expect(tamaño).toHaveValue(1.5)
    expect(pre).toHaveTextContent('font-size: 1.5em;')
    expect(pre).not.toHaveTextContent('font-size: em;')
  })

  it('un valor fuera de rango se clampa en el blur', () => {
    const tamaño = screen.getByLabelText('Tamaño') // min 1, max 2

    fireEvent.change(tamaño, { target: { value: '99' } })
    // fuera de rango: el contexto se mantiene en el último valor válido
    expect(pre).toHaveTextContent('font-size: 1.2em;')

    fireEvent.blur(tamaño)
    expect(tamaño).toHaveValue(2)
    expect(pre).toHaveTextContent('font-size: 2em;')
  })
})

describe('vista de editor de código', () => {
  it('numera las líneas sin incluirlas en el texto copiable', () => {
    const gutter = container.querySelector('.codigo-lineas')

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

describe('temas predefinidos', () => {
  it('aplicar un tema cambia el preview Y el snippet', () => {
    fireEvent.click(screen.getByRole('button', { name: /tema Consola/i }))

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
    fireEvent.click(screen.getByRole('button', { name: /tema Impacto/i }))
    fireEvent.click(screen.getByRole('button', { name: /tema Clásico/i }))

    expect(preview.style.color).toBe('rgb(240, 248, 255)') // #F0F8FF
    expect(preview.style.textAlign).toBe('left')
    expect(pre).toHaveTextContent('font-size: 1.2em;')
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

  it('marca con aria-pressed el tema aplicado', () => {
    const clasico = screen.getByRole('button', { name: /tema Clásico/i })
    const consola = screen.getByRole('button', { name: /tema Consola/i })

    // la app arranca con los defaults = tema Clásico
    expect(clasico).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(consola)

    expect(consola).toHaveAttribute('aria-pressed', 'true')
    expect(clasico).toHaveAttribute('aria-pressed', 'false')
  })

  it('al editar a mano ningún tema queda marcado', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    const botones = screen.getAllByRole('button', { name: /aplicar tema/i })
    for (const boton of botones) {
      expect(boton).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('restablecer estilos vuelve a marcar Clásico', () => {
    fireEvent.click(screen.getByRole('button', { name: /tema Impacto/i }))
    fireEvent.click(
      screen.getByRole('button', { name: /restablecer estilos/i }),
    )

    expect(
      screen.getByRole('button', { name: /tema Clásico/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('con un tema claro el encabezado del preview usa su color de texto', () => {
    fireEvent.click(screen.getByRole('button', { name: /tema Editorial/i }))

    expect(screen.getByRole('heading', { name: /vista previa/i })).toHaveStyle({
      color: 'rgb(34, 34, 34)',
    }) // #222222 sobre beige
  })
})

describe('botón copiar', () => {
  it('copia exactamente el string que muestra el snippet', async () => {
    // fireEvent en vez de user-event: setup() de user-event secuestra el
    // navigator.clipboard y rompería el espía
    fireEvent.click(screen.getByRole('button', { name: /copiar/i }))

    await screen.findByText('✔')
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(pre.textContent)
  })

  it('feedbacka error si el clipboard falla', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error('denegado'),
    )

    fireEvent.click(screen.getByRole('button', { name: /copiar/i }))

    await screen.findByText('❗')
  })
})

describe('compartir por URL', () => {
  it('un enlace compartido gana sobre lo guardado y se limpia el hash', () => {
    const texto = { ...TEXTO_POR_DEFECTO, titulo: 'Texto compartido' }
    const estilos = { ...ESTILOS_POR_DEFECTO, color: '#123456' }
    window.location.hash = `s=${codificarEstado(texto, estilos)}`

    app.unmount()
    renderApp()

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

describe('persistencia en localStorage', () => {
  it('los estilos sobreviven a un remount', () => {
    fireEvent.change(screen.getByLabelText('Color letra'), {
      target: { value: '#123456' },
    })

    app.unmount()
    renderApp()

    expect(preview.style.color).toBe('rgb(18, 52, 86)')
    expect(pre).toHaveTextContent('color: #123456;')
  })

  it('el texto editado sobrevive a un remount', () => {
    const h2 = within(preview).getByText('Texto de Ejemplo')
    h2.textContent = 'Texto persistido'
    fireEvent.input(h2)

    app.unmount()
    renderApp()

    expect(within(preview).getByText('Texto persistido')).toBeInTheDocument()
    expect(pre).toHaveTextContent('Texto persistido')
  })

  it('datos corruptos en el storage no rompen la app', () => {
    localStorage.setItem(CLAVE_ESTILOS, '{roto')
    localStorage.setItem(CLAVE_TEXTO, '{roto')

    app.unmount()
    renderApp()

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
    expect(JSON.parse(localStorage.getItem(CLAVE_ESTILOS)).color).toBe(
      '#F0F8FF',
    )
    expect(JSON.parse(localStorage.getItem(CLAVE_TEXTO)).titulo).toBe(
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
    expect(JSON.parse(localStorage.getItem(CLAVE_ESTILOS)).color).toBe(
      '#123456',
    )
  })
})
