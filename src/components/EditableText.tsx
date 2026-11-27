import { useLayoutEffect, useRef } from 'react'
import type { ClipboardEvent, ElementType, SyntheticEvent } from 'react'
import type { ParametrosEditableText } from '../types'

// Detección de soporte de contenteditable="plaintext-only". En navegadores sin
// soporte el atributo se considera inválido y el elemento queda NO editable,
// lo que rompería toda la edición del preview.
const soportaPlaintextOnly = (() => {
  const elemento = document.createElement('div')
  elemento.setAttribute('contenteditable', 'plaintext-only')
  return elemento.contentEditable === 'plaintext-only'
})()

// Elemento editable cuyo contenido React NUNCA toca después del mount:
// el texto lo escribe el usuario en el DOM y este componente queda vacío en
// el vdom (sin children). El efecto solo escribe cuando el estado externo
// difiere del DOM (ej. "Restablecer texto") → mientras se tipea nunca escribe
// y por lo tanto el caret no salta.
export const EditableText = ({
  etiqueta = 'p',
  nombre,
  valor,
  onCambio,
}: ParametrosEditableText) => {
  const ref = useRef<HTMLElement | null>(null)
  const Tag = etiqueta as ElementType

  // useLayoutEffect: escribe ANTES del paint → nunca hay frame en blanco al
  // montar ni al restablecer
  useLayoutEffect(() => {
    const elemento = ref.current
    if (elemento && elemento.textContent !== valor) {
      elemento.textContent = valor
    }
  }, [valor])

  function manejarInput(e: SyntheticEvent<HTMLElement>) {
    // currentTarget (el elemento con el handler) en vez de target: tipado
    // correcto y aquí siempre son el mismo nodo
    onCambio(e.currentTarget.textContent ?? '')
  }

  // sanitiza el pegado en TODOS los navegadores (no depende de la detección):
  // en soportes sin execCommand no se cancela el evento y manda el nativo
  function manejarPaste(e: ClipboardEvent<HTMLElement>) {
    if (typeof document.execCommand !== 'function') return
    e.preventDefault()
    const textoPlano = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, textoPlano)
  }

  return (
    <Tag
      ref={ref}
      // el nombre accesible de un campo editable no debe ser su contenido:
      // así el lector de pantalla annuncia qué campo es antes de leerlo
      aria-label={nombre}
      contentEditable={soportaPlaintextOnly ? 'plaintext-only' : 'true'}
      onInput={manejarInput}
      onPaste={manejarPaste}
    />
  )
}
