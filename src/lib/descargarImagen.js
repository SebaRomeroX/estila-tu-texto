/**
 * Descarga un nodo del preview como imagen PNG, sin backend. El fondo se
 * recibe aparte porque html-to-image no hereda el background del contenedor
 * en el lienzo: sin él, un tema oscuro saldría transparente. Si llega vacío,
 * el PNG se genera con transparencia real (sin backgroundColor).
 *
 * La librería se importa en el momento: solo se necesita al exportar y así no
 * pesa en la carga inicial de la app.
 *
 * @param {HTMLElement} nodo
 * @param {string} fondo
 * @param {string} nombre
 */
export async function descargarImagen(
  nodo,
  fondo,
  nombre = 'estila-tu-texto.png',
) {
  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(nodo, {
    cacheBust: true,
    pixelRatio: 2,
    ...(fondo ? { backgroundColor: fondo } : {}),
  })

  const enlace = document.createElement('a')
  enlace.href = dataUrl
  enlace.download = nombre
  enlace.hidden = true
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
}
