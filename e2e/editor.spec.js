import { expect, test } from '@playwright/test'
import { evaluarContraste } from '../src/lib/contraste.js'

/**
 * Abre la app y espera a que el preview y las fuentes estén listos: sin eso,
 * la exportación PNG puede capturar un fallback antes de que carguen las web.
 *
 * @param {import('@playwright/test').Page} page
 */
async function abrirApp(page) {
  await page.goto('/')
  await page.locator('article.visualizador').first().waitFor()
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Cambia un input de color con los eventos nativos que React escucha. El
 * setter del prototipo evita que el value tracker de React descarte el cambio.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} etiqueta
 * @param {string} valor
 */
async function cambiarColor(page, etiqueta, valor) {
  await page.getByLabel(etiqueta).evaluate((elemento, color) => {
    const input = /** @type {HTMLInputElement} */ (elemento)
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )
    descriptor?.set?.call(input, color)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, valor)
}

/**
 * @param {string} rgb color computado por el navegador ("rgb(r, g, b)")
 * @returns {string}
 */
function rgbAHex(rgb) {
  const canales = (rgb.match(/\d+/g) ?? []).map(Number)
  return `#${canales
    .map((canal) => canal.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * Dispara la descarga y devuelve el archivo y sus bytes.
 *
 * @param {import('@playwright/test').Page} page
 */
async function descargarPng(page) {
  const esperaDescarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar imagen' }).click()
  const download = await esperaDescarga
  const stream = await download.createReadStream()

  /** @type {Buffer[]} */
  const trozos = []
  for await (const trozo of stream) trozos.push(trozo)

  return { download, png: Buffer.concat(trozos) }
}

test('capturas de regresión visual del preview', async ({ page }) => {
  await abrirApp(page)
  const preview = page.locator('article.visualizador').first()

  // el clip de la captura se redondea según la posición vertical del elemento:
  // llevarlo al borde superior evita que un cambio de altura del editor
  // desplace el preview 1 px y rompa el snapshot sin cambiar su contenido
  const alinearPreview = () =>
    preview.evaluate((elemento) => elemento.scrollIntoView({ block: 'start' }))

  // sin cambios: el snapshot por defecto protege tipografía, colores y
  // espaciado del bloque base
  await alinearPreview()
  await expect(preview).toHaveScreenshot('preview-default.png')

  // tema claro + degradado: cubre variables, fondo y relleno del texto
  await page.getByLabel('Temas:').selectOption('editorial')
  await page.getByLabel('Degradado de texto').selectOption('degradado')
  await alinearPreview()
  await expect(preview).toHaveScreenshot('preview-editorial-degradado.png')
})

test('el preview y el snippet comparten variables y estado', async ({
  page,
}) => {
  await abrirApp(page)
  const preview = page.locator('article.visualizador').first()

  await cambiarColor(page, 'Color letra', '#123456')
  await cambiarColor(page, 'Color fondo', '#ffffff')

  // CSS computado real, no el style inline que ya cubre jsdom
  await expect(preview).toHaveCSS('color', 'rgb(18, 52, 86)')
  await expect(preview).toHaveCSS('background-color', 'rgb(255, 255, 255)')

  await page.getByLabel('Degradado de texto').selectOption('degradado')
  await expect(preview).toHaveClass(/visualizador-degradado/)
  expect(
    await preview.evaluate((el) => el.style.getPropertyValue('--degradado')),
  ).toBe('linear-gradient(135deg, #F0F8FF, #2D5AAD)')
  await expect(preview.locator('h2')).toHaveCSS(
    'background-image',
    /linear-gradient/,
  )

  const codigo = (await page.locator('pre').textContent()) ?? ''
  expect(codigo).toContain('color: #123456;')
  expect(codigo).toContain('background: #ffffff;')
  expect(codigo).toContain(
    'background-image: linear-gradient(135deg, #F0F8FF, #2D5AAD);',
  )
})

test('dos columnas se reparten en el navegador', async ({ page }, testInfo) => {
  await abrirApp(page)

  // con una medida angosta el texto se reparte sí o sí en dos columnas
  await page.getByLabel('Ancho linea (ch)').fill('30')
  await page.getByLabel('Columnas').selectOption('dos')

  const preview = page.locator('article.visualizador').first()
  await expect(preview).toHaveCSS('column-count', '2')
  await expect(preview.locator('h2')).toHaveCSS('column-span', 'all')

  const columnas = await preview.evaluate((el) => {
    const rango = document.createRange()
    rango.selectNodeContents(el)
    const posiciones = [...rango.getClientRects()].map((rect) =>
      Math.round(rect.x),
    )
    return new Set(posiciones).size
  })
  expect(columnas).toBeGreaterThanOrEqual(2)

  const captura = await preview.screenshot()
  expect(captura.subarray(1, 4).toString()).toBe('PNG')
  await testInfo.attach('preview-dos-columnas.png', {
    body: captura,
    contentType: 'image/png',
  })
})

test('el idioma cambia la interfaz y se recuerda al recargar', async ({
  page,
}) => {
  await abrirApp(page)
  await page.getByLabel('Idioma').selectOption('en')

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  await page.reload()
  await page.locator('article.visualizador').first().waitFor()

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  await expect(page.getByLabel('Block opacity')).toBeVisible()
})

test('la tarjeta glass aplica desenfoque y fondo translúcido', async ({
  page,
}) => {
  await abrirApp(page)
  await page.getByLabel('Tarjeta glass').selectOption('si')

  const preview = page.locator('article.visualizador').first()
  await expect(preview).toHaveCSS('background-color', 'rgba(2, 2, 2, 0.55)')
  expect(
    await preview.evaluate((el) => getComputedStyle(el).backdropFilter),
  ).toContain('blur(14px)')
})

test('la animación de entrada respeta prefers-reduced-motion', async ({
  page,
}) => {
  await abrirApp(page)
  await page.getByLabel('Animación de entrada').selectOption('entrada')

  const preview = page.locator('article.visualizador').first()
  await expect(preview).toHaveClass(/visualizador-animacion/)
  await expect(preview).toHaveCSS('animation-name', 'texto-entrada-preview')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(preview).toHaveCSS('animation-name', 'none')
})

test('el contraste indicado coincide con los colores renderizados', async ({
  page,
}) => {
  await abrirApp(page)
  const preview = page.locator('article.visualizador').first()

  const [color, fondo] = await preview.evaluate((el) => {
    const estilos = getComputedStyle(el)
    return [estilos.color, estilos.backgroundColor]
  })

  const resultado = evaluarContraste(rgbAHex(color), rgbAHex(fondo))
  if (!resultado) throw new Error('Los colores renderizados no son hex')

  const indicador = page.locator('.contraste', {
    hasText: 'Contraste texto/fondo',
  })
  await expect(indicador).toContainText(`${resultado.ratio.toFixed(2)}:1`)
  await expect(indicador).toContainText(resultado.nivel)

  // texto y fondo iguales: el peor caso debe reflejarse en el indicador
  await cambiarColor(page, 'Color letra', '#020202')
  await expect(indicador).toContainText('1.00:1')
  await expect(indicador).toContainText('Insuficiente')
})

test('descarga un PNG real del preview', async ({ page }, testInfo) => {
  await abrirApp(page)
  const { download, png } = await descargarPng(page)

  expect(download.suggestedFilename()).toBe('estila-tu-texto.png')
  // firma PNG + ancho y alto del IHDR en big-endian
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect(png.readUInt32BE(16)).toBeGreaterThan(0)
  expect(png.readUInt32BE(20)).toBeGreaterThan(0)

  await testInfo.attach('preview-export.png', {
    body: png,
    contentType: 'image/png',
  })
})

test('el PNG con fondo transparente conserva alfa', async ({ page }) => {
  await abrirApp(page)
  await page.getByLabel('Fondo del bloque').selectOption('si')
  const { png } = await descargarPng(page)

  const alfa = await page.evaluate(async (base64) => {
    const imagen = new Image()
    imagen.src = `data:image/png;base64,${base64}`
    await imagen.decode()

    const canvas = document.createElement('canvas')
    canvas.width = imagen.width
    canvas.height = imagen.height
    const contexto = canvas.getContext('2d')
    contexto?.drawImage(imagen, 0, 0)
    return contexto?.getImageData(0, 0, 1, 1).data[3] ?? -1
  }, png.toString('base64'))

  // la esquina cae en el padding del bloque: sin fondo debe ser transparente
  expect(alfa).toBe(0)
})
