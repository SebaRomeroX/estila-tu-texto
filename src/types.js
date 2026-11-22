/**
 * Tipos del dominio del proyecto, en JSDoc y chequeados por `npm run typecheck`
 * (jsconfig.json → checkJs + noImplicitAny). Fuente única de las formas que
 * circulan entre context, componentes y la generación de código.
 *
 * @typedef {Object} Estilos
 * @property {string} color
 * @property {string} background
 * @property {string} family
 * @property {string} size
 * @property {string} weight
 * @property {string} spacing
 * @property {string} height
 * @property {string} gap
 * @property {string} align
 * @property {string} ancho
 * @property {string} transform
 * @property {string} decoracion
 * @property {string} estiloLetra
 * @property {string} escalaTitulo
 * @property {string} sangria
 * @property {string} espacioPalabras
 * @property {string} versalitas
 * @property {string} corteLinea
 * @property {string} letraCapitular
 *
 * @typedef {keyof Estilos} CampoEstilo
 *
 * @typedef {Object} Texto
 * @property {string} titulo
 * @property {string} parrafo1
 * @property {string} parrafo2
 * @property {string} subtitulo
 * @property {string} parrafo3
 *
 * @typedef {keyof Texto} CampoTexto
 *
 * @typedef {Object} ContextoEstilos
 * @property {Estilos} estilos
 * @property {(campo: CampoEstilo, valor: string) => void} actualizarEstilos
 * @property {(nuevos: Estilos) => void} aplicarEstilos
 * @property {Estilos[]} historial estados de la sesión (incluye el actual)
 * @property {number} indiceHistorial posición del estado actual
 * @property {boolean} puedeDeshacer
 * @property {boolean} puedeRehacer
 * @property {() => void} deshacer
 * @property {() => void} rehacer
 * @property {(indice: number) => void} irAHistorial
 * @property {() => void} limpiarHistorial deja solo el estado actual
 *
 * @typedef {Object} Preset
 * @property {string} id
 * @property {string} nombre
 * @property {Estilos} estilos
 *
 * @typedef {Object} PresetPropio
 * @property {string} nombre clave única (sin distinguir mayúsculas)
 * @property {Estilos} estilos
 *
 * @typedef {'etiqueta' | 'atributo' | 'valor-html' | 'texto' | 'selector' | 'propiedad' | 'valor-css' | 'puntuacion'} TipoToken
 *
 * @typedef {Object} Token
 * @property {TipoToken} tipo
 * @property {string} texto
 *
 * @typedef {Object} Rgb
 * @property {number} r
 * @property {number} g
 * @property {number} b
 *
 * @typedef {'AAA' | 'AA' | 'AA (texto grande)' | 'Insuficiente'} NivelContraste
 *
 * @typedef {Object} ResultadoContraste
 * @property {number} ratio
 * @property {NivelContraste} nivel
 *
 * @typedef {Object} Opcion
 * @property {string} nombre
 * @property {string | number} contenido
 *
 * @typedef {Object} Fuente
 * @property {string} nombre
 * @property {string} contenido pila CSS que se guarda y se emite
 * @property {boolean} web true si se self-hostea en public/fonts
 * @property {string} [google] familia para la CSS2 API de Google Fonts
 * @property {string} [grupo] etiqueta del <optgroup>
 *
 * @typedef {Object} ElementoInput
 * @property {string} label
 * @property {CampoEstilo} campo
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Opcion[]} [opciones]
 *
 * @typedef {Object} ParametrosInput
 * @property {ElementoInput} elemento
 *
 * @typedef {Object} ParametrosEditableText
 * @property {string} [etiqueta] etiqueta HTML a renderizar (default: p)
 * @property {string} [nombre] nombre accesible del campo editable
 * @property {string} valor
 * @property {(valor: string) => void} onCambio
 *
 * @typedef {Object} ParametrosVisualizador
 * @property {Texto} texto
 * @property {(campo: CampoTexto, valor: string) => void} actualizarTexto
 * @property {() => void} restablecerTexto
 *
 * @typedef {Object} ParametrosSalida
 * @property {Texto} texto
 */

export {}
