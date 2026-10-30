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
 *
 * @typedef {Object} Preset
 * @property {string} id
 * @property {string} nombre
 * @property {Estilos} estilos
 *
 * @typedef {Object} Opcion
 * @property {string} nombre
 * @property {string | number} contenido
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
