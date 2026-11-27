import type { Texto } from '../types'

/**
 * Texto de ejemplo: fuente única para el estado inicial, el reset y el saneo
 * de los enlaces compartidos.
 */
export const TEXTO_POR_DEFECTO: Texto = Object.freeze({
  titulo: 'Texto de Ejemplo',
  parrafo1: 'Esta es una vista previa de tus estilos.',
  parrafo2:
    'Puedes escribir lo que quieras aqui para ver como se aplican los estilos. Este va a ser un string mas largo para que se aprecie el salto de linea y la distancia entre ellas.',
  subtitulo: 'Pega un texto',
  parrafo3: 'Puedes copiar cualquien texto y pegarlo aqui, si prefieres.',
})
