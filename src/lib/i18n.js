/**
 * Internacionalización mínima de la interfaz. El español es el idioma fuente:
 * las claves son los textos en español y el diccionario inglés solo traduce.
 * Los textos con partes variables usan marcadores `{nombre}`.
 */

export const CLAVE_IDIOMA = 'estila-tu-texto:idioma'
export const IDIOMA_POR_DEFECTO = 'es'

/** @type {ReadonlyArray<{ id: string, nombre: string }>} */
export const IDIOMAS = Object.freeze([
  { id: 'es', nombre: 'Español' },
  { id: 'en', nombre: 'English' },
])

/** @type {Readonly<Record<string, string>>} */
const TEXTOS_EN = Object.freeze({
  Idioma: 'Language',
  'Hecho con ❤ por': 'Made with ❤ by',
  'Guardado local: tu texto y estilos se quedan en este navegador (localStorage); en un equipo compartido, quienes tengan acceso podrán verlos.':
    'Local storage: your text and styles stay in this browser (localStorage); on a shared computer, anyone with access can see them.',
  'Borrar datos guardados': 'Delete saved data',
  'Se borrarán tu texto y estilos guardados en este navegador. ¿Continuar?':
    'Your saved text and styles will be deleted from this browser. Continue?',
  'Datos guardados borrados': 'Saved data deleted',

  Configuracion: 'Settings',
  'Temas:': 'Themes:',
  'Aplicar tema {nombre}': 'Apply {nombre} theme',
  'Restablecer estilos': 'Reset styles',
  Deshacer: 'Undo',
  Rehacer: 'Redo',
  Historial: 'History',
  'Mis temas:': 'My themes:',
  'Aplicar tema propio {nombre}': 'Apply my theme {nombre}',
  'Eliminar tema propio {nombre}': 'Delete my theme {nombre}',
  '(actual)': '(current)',
  'Guardar tema actual': 'Save current theme',
  'Mi tema': 'My theme',
  'Guardar tema': 'Save theme',
  'Tema «{nombre}» guardado': 'Theme "{nombre}" saved',
  'Tema «{nombre}» eliminado': 'Theme "{nombre}" deleted',
  'Con fondo transparente, «Color fondo» solo se usa como referencia de contraste: el bloque y la imagen se exportan sin fondo.':
    'With a transparent background, "Background color" is only a contrast reference: the block and the image are exported without a background.',

  Clásico: 'Classic',
  Consola: 'Console',
  Impacto: 'Impact',

  'Vista previa': 'Preview',
  Plantilla: 'Template',
  'Elegir plantilla…': 'Choose a template…',
  Ensayo: 'Essay',
  Cuento: 'Short story',
  Carta: 'Letter',
  'Descargar imagen': 'Download image',
  'Generando…': 'Generating…',
  'Vista limpia': 'Clean view',
  'Cerrar vista limpia': 'Close clean view',
  'Restablecer texto': 'Reset text',
  'Generando imagen…': 'Generating image…',
  'Imagen descargada.': 'Image downloaded.',
  'No se pudo generar la imagen. Intentá de nuevo.':
    'Could not generate the image. Try again.',
  'Se reemplazará el texto actual por la plantilla "{nombre}". ¿Continuar?':
    'The current text will be replaced with the "{nombre}" template. Continue?',
  Título: 'Title',
  Subtítulo: 'Subtitle',
  'Párrafo 1': 'Paragraph 1',
  'Párrafo 2': 'Paragraph 2',
  'Párrafo 3': 'Paragraph 3',

  Codigo: 'Code',
  'Descargar .html': 'Download .html',
  Compartir: 'Share',
  'Copiar HTML': 'Copy HTML',
  'Copiar CSS': 'Copy CSS',
  'Copiar HTML y CSS': 'Copy HTML and CSS',
  'Copiar todo': 'Copy all',
  'Código copiado al portapapeles': 'Code copied to clipboard',
  'Cargando código…': 'Loading code…',
  'Error al copiar el código': 'Could not copy the code',
  'HTML copiado al portapapeles': 'HTML copied to clipboard',
  'Error al copiar el HTML': 'Could not copy the HTML',
  'CSS copiado al portapapeles': 'CSS copied to clipboard',
  'Error al copiar el CSS': 'Could not copy the CSS',
  'Enlace copiado al portapapeles': 'Link copied to clipboard',
  'No se pudo copiar el enlace': 'Could not copy the link',

  'Espacio elementos': 'Element spacing',
  'Tamaño (rem)': 'Size (rem)',
  'Altura linea': 'Line height',
  'Espacio letras': 'Letter spacing',
  'Espacio palabras (em)': 'Word spacing (em)',
  'Sangría primera línea (em)': 'First-line indent (em)',
  'Ancho linea (ch)': 'Line width (ch)',
  'Tamaño titulo (%)': 'Title size (%)',
  'Tamaño subtítulo (%)': 'Subtitle size (%)',
  'Opacidad del bloque': 'Block opacity',
  'Ancho borde (px)': 'Border width (px)',
  'Radio del borde (px)': 'Border radius (px)',
  'Sombra X (px)': 'Shadow X (px)',
  'Sombra Y (px)': 'Shadow Y (px)',
  'Difuminado sombra (px)': 'Shadow blur (px)',
  'Ancho contorno (px)': 'Outline width (px)',
  'Padding vertical (px)': 'Vertical padding (px)',
  'Padding horizontal (px)': 'Horizontal padding (px)',

  'Posicion texto': 'Text position',
  'Fondo del bloque': 'Block background',
  'Ancho letra': 'Font weight',
  'Fuente título': 'Title font',
  'Ancho título': 'Title weight',
  'Fuente subtítulo': 'Subtitle font',
  'Ancho subtítulo': 'Subtitle weight',
  Mayusculas: 'Uppercase',
  Decoracion: 'Decoration',
  'Estilo letra': 'Font style',
  Versalitas: 'Small caps',
  'Corte de línea': 'Line break',
  'Letra capitular': 'Drop cap',
  Sombra: 'Shadow',
  'Selección de texto': 'Text selection',
  'Degradado de texto': 'Text gradient',
  Columnas: 'Columns',
  Borde: 'Border',
  'Contorno de texto': 'Text outline',
  'Animación de entrada': 'Entry animation',
  'Tarjeta glass': 'Glass card',

  'Color letra': 'Text color',
  'Color fondo': 'Background color',
  'Fondo selección': 'Selection background',
  'Texto seleccionado': 'Selected text',
  'Degradado inicio': 'Gradient start',
  'Degradado fin': 'Gradient end',
  'Color borde': 'Border color',
  'Color sombra': 'Shadow color',
  'Color contorno': 'Outline color',
  'Color título': 'Title color',
  'Color propio título': 'Custom title color',
  'Color subtítulo': 'Subtitle color',
  'Color propio subtítulo': 'Custom subtitle color',
  heredado: 'inherited',

  inicio: 'start',
  centrado: 'center',
  'color sólido': 'solid color',
  transparente: 'transparent',
  ninguna: 'none',
  ninguno: 'none',
  MAYÚSCULAS: 'UPPERCASE',
  minúsculas: 'lowercase',
  Capitalizar: 'Capitalize',
  subrayado: 'underline',
  tachado: 'strikethrough',
  normal: 'normal',
  cursiva: 'italic',
  versalitas: 'small caps',
  balanceado: 'balanced',
  pretty: 'pretty',
  'sí (primer párrafo)': 'yes (first paragraph)',
  suave: 'soft',
  resplandor: 'glow',
  personalizada: 'custom',
  degradado: 'gradient',
  una: 'one',
  dos: 'two',
  no: 'no',
  sí: 'yes',
  'entrada suave': 'soft entry',
  'sí, cargada': 'yes, loaded',
  cargada: 'loaded',
  'no instalada': 'not installed',
  Web: 'Web',
  Sistema: 'System',
  Genéricas: 'Generic',

  'contraste texto/fondo': 'text/background contrast',
  'contraste selección': 'selection contrast',
  'contraste título': 'title contrast',
  'contraste subtítulo': 'subtitle contrast',
  ' (referencia)': ' (reference)',
  'Contraste texto/fondo': 'Text/background contrast',
  'Contraste selección': 'Selection contrast',
  'Contraste título': 'Title contrast',
  'Contraste subtítulo': 'Subtitle contrast',
  Insuficiente: 'Insufficient',
  'AA (texto grande)': 'AA (large text)',

  Fuente: 'Font',
  'no está instalada': 'is not installed',
  'no están instaladas': 'are not installed',
  '{nombres} {verbo} en este equipo: la vista previa usa una fuente de respaldo. Elige una de las cargadas para que se vea igual en todos lados.':
    '{nombres} {verbo} on this computer: the preview uses a fallback font. Pick one of the loaded fonts so it looks the same everywhere.',
  ' está instalada': ' is installed',
  ' están instaladas': ' are installed',

  'Fuente web: carga esta hoja para que el texto se vea igual fuera de la app':
    'Web font: load this stylesheet so the text looks the same outside the app',
  'Fuentes web: carga estas hojas para que el texto se vea igual fuera de la app':
    'Web fonts: load these stylesheets so the text looks the same outside the app',
})

/**
 * Un idioma desconocido (storage editado a mano) cae a español.
 *
 * @param {string} valor
 * @returns {'es' | 'en'}
 */
export function normalizarIdioma(valor) {
  return valor === 'en' ? 'en' : 'es'
}

/**
 * Traduce un texto de la interfaz. En español devuelve el original; en inglés
 * busca en el diccionario y, si falta la clave, conserva el español. Los
 * marcadores `{nombre}` se reemplazan con `datos`; si falta el dato, el
 * marcador queda visible en vez de romper el texto.
 *
 * @param {string} idioma
 * @param {string} texto
 * @param {Record<string, string | number>} [datos]
 * @returns {string}
 */
export function traducir(idioma, texto, datos = {}) {
  const plantilla =
    normalizarIdioma(idioma) === 'en' ? (TEXTOS_EN[texto] ?? texto) : texto

  return plantilla.replace(/\{(\w+)\}/g, (marcador, nombre) =>
    Object.hasOwn(datos, nombre) ? String(datos[nombre]) : marcador,
  )
}

/**
 * Lee el idioma guardado en este navegador. Nunca lanza.
 *
 * @returns {'es' | 'en'}
 */
export function cargarIdioma() {
  try {
    return normalizarIdioma(localStorage.getItem(CLAVE_IDIOMA) ?? '')
  } catch {
    return IDIOMA_POR_DEFECTO
  }
}

/**
 * Guarda el idioma para la próxima visita. Si el storage falla, la sesión
 * sigue funcionando con el idioma elegido en memoria.
 *
 * @param {string} idioma
 */
export function guardarIdioma(idioma) {
  try {
    localStorage.setItem(CLAVE_IDIOMA, normalizarIdioma(idioma))
  } catch {
    // sin persistencia, pero la UI ya cambió de idioma
  }
}
