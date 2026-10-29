import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App.jsx'
import { EstilosProvider } from './context/EstilosProvider.jsx'

/** @type {HTMLElement} */
let container
/** @type {HTMLPreElement} */
let pre
/** @type {HTMLElement} */
let preview

beforeEach(() => {
  vi.clearAllMocks()
  // user-event reemplaza navigator.clipboard en su setup(): re-instalamos el
  // espía en cada test para no depender del orden
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  })

  // igual que en main.jsx: la app vive dentro del provider
  const utils = render(
    <EstilosProvider>
      <App />
    </EstilosProvider>,
  )
  container = utils.container
  pre = container.querySelector('pre')
  preview = container.querySelector('.visualizador')
})

describe('preview y snippet compartidos', () => {
  it('renderiza el texto por defecto en el preview y en el snippet', () => {
    expect(screen.getByText('Texto de Ejemplo')).toBeInTheDocument()
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
    fireEvent.change(screen.getByLabelText('Fuente'), {
      target: { value: 'Arial, Helvetica, sans-serif' },
    })

    expect(preview.style.fontFamily).toBe('Arial, Helvetica, sans-serif')
    expect(pre).toHaveTextContent('font-family: Arial, Helvetica, sans-serif;')
  })

  it('cambiar el tamaño numérico actualiza el preview Y el snippet', () => {
    fireEvent.change(screen.getByLabelText('Tamaño'), {
      target: { value: '1.5' },
    })

    expect(preview.style.fontSize).toBe('1.5em')
    expect(pre).toHaveTextContent('font-size: 1.5em;')
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
    const h2 = screen.getByText('Texto de Ejemplo')

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
