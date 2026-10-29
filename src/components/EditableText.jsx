import { useLayoutEffect, useRef } from "react"

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
export const EditableText = ({ etiqueta = 'p', valor, onCambio }) => {
  const ref = useRef(null)
  const Tag = etiqueta

  // useLayoutEffect: escribe ANTES del paint → nunca hay frame en blanco al
  // montar ni al restablecer
  useLayoutEffect(() => {
    const elemento = ref.current
    if (elemento && elemento.textContent !== valor) {
      elemento.textContent = valor
    }
  }, [valor])

  function manejarInput (e) {
    onCambio(e.target.textContent)
  }

  // sanitiza el pegado en TODOS los navegadores (no depende de la detección):
  // en soportes sin execCommand no se cancela el evento y manda el nativo
  function manejarPaste (e) {
    if (typeof document.execCommand !== 'function') return
    e.preventDefault()
    const textoPlano = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, textoPlano)
  }

  return (
    <Tag
      ref={ref}
      contentEditable={soportaPlaintextOnly ? 'plaintext-only' : 'true'}
      onInput={manejarInput}
      onPaste={manejarPaste}
    />
  )
}
