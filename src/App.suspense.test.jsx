import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { EstilosProvider } from './context/EstilosProvider'
import { IdiomaProvider } from './context/IdiomaProvider'

// Suspense solo muestra el fallback mientras la promesa del chunk está
// pendiente. Se simula un módulo que "tarda" para poder observarlo.
const estado = vi.hoisted(() => ({
  /** @type {Promise<void> | null} */
  promesa: null,
  /** @type {(() => void) | null} */
  resolver: null,
}))

vi.mock('./components/Salida', () => ({
  SalidaCodigo: () => {
    if (!estado.promesa) {
      estado.promesa = new Promise((resolver) => {
        estado.resolver = resolver
      })
      throw estado.promesa
    }
    return null
  },
}))

afterEach(() => {
  localStorage.clear()
})

describe('carga diferida del snippet', () => {
  it('muestra un estado accesible mientras se carga el chunk', async () => {
    render(
      <IdiomaProvider>
        <EstilosProvider>
          <App />
        </EstilosProvider>
      </IdiomaProvider>,
    )

    const aviso = screen.getByText('Cargando código…')
    expect(aviso).toHaveAttribute('role', 'status')

    // al resolverse el chunk, el fallback desaparece
    await act(async () => {
      estado.resolver?.()
    })

    expect(screen.queryByText('Cargando código…')).not.toBeInTheDocument()
  })
})
