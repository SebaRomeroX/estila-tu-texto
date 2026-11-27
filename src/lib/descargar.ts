/**
 * Descarga un string como archivo, sin backend ni dependencias: Blob + un
 * <a download> temporal. Pensado para el documento .html generado.
 */
export function descargarHtml(
  contenido: string,
  nombre = 'estila-tu-texto.html',
): void {
  const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = nombre
  enlace.hidden = true
  document.body.append(enlace)
  enlace.click()
  enlace.remove()

  // Safari necesita que la URL siga viva durante el click: se libera después.
  // El guard cubre entornos sin revokeObjectURL (tests con mocks puntuales).
  setTimeout(() => URL.revokeObjectURL?.(url), 0)
}
