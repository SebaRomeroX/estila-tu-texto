import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EditableText } from './EditableText.jsx'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EditableText', () => {
  it('muestra el valor al montar', () => {
    const { container } = render(
      <EditableText etiqueta='h2' valor='Hola mundo' onCambio={() => {}} />,
    )
    expect(container.querySelector('h2')).toHaveTextContent('Hola mundo')
  })

  it('declara contentEditable en el elemento', () => {
    const { container } = render(
      <EditableText etiqueta='p' valor='base' onCambio={() => {}} />,
    )
    expect(container.querySelector('p')).toHaveAttribute('contenteditable')
  })

  it('notifica el texto al tipear', () => {
    const onCambio = vi.fn()
    const { container } = render(
      <EditableText etiqueta='p' valor='base' onCambio={onCambio} />,
    )
    const elemento = container.querySelector('p')

    elemento.textContent = 'base editada'
    fireEvent.input(elemento)

    expect(onCambio).toHaveBeenCalledWith('base editada')
  })

  it('no reescribe el DOM tras un re-render si el usuario editó', () => {
    function Vista() {
      const [valor, setValor] = useState('inicial')
      const [, setTick] = useState(0)

      return (
        <div>
          <button type='button' onClick={() => setTick((t) => t + 1)}>
            redibujar
          </button>
          <EditableText etiqueta='h3' valor={valor} onCambio={setValor} />
        </div>
      )
    }

    const { container } = render(<Vista />)
    const h3 = container.querySelector('h3')

    // el usuario edita en el DOM y el estado se sincroniza con él
    h3.textContent = 'editado a mano'
    fireEvent.input(h3)

    // re-render por una causa no relacionada
    fireEvent.click(screen.getByRole('button', { name: 'redibujar' }))

    expect(h3).toHaveTextContent('editado a mano')
    expect(h3).not.toHaveTextContent('inicial')
  })

  it('sincroniza cambios externos del valor hacia el DOM', () => {
    function Externo() {
      const [valor, setValor] = useState('uno')

      return (
        <div>
          <button type='button' onClick={() => setValor('dos')}>
            cambiar desde fuera
          </button>
          <EditableText etiqueta='p' valor={valor} onCambio={() => {}} />
        </div>
      )
    }

    const { container } = render(<Externo />)
    const parrafo = container.querySelector('p')
    expect(parrafo).toHaveTextContent('uno')

    fireEvent.click(screen.getByRole('button', { name: 'cambiar desde fuera' }))

    expect(parrafo).toHaveTextContent('dos')
  })

  it('fuerza texto plano al pegar', () => {
    const { container } = render(
      <EditableText etiqueta='p' valor='x' onCambio={() => {}} />,
    )
    const elemento = container.querySelector('p')

    const noCancelado = fireEvent.paste(elemento, {
      clipboardData: { getData: vi.fn(() => '<b>rico</b>') },
    })

    expect(noCancelado).toBe(false)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '<b>rico</b>',
    )
  })
})
