import { Fragment } from 'react'
import type { Token } from '../types'

interface ParametrosCodigoResaltado {
  lineas: Token[][]
}

/**
 * Vista de "editor de código" del snippet: números de línea en un gutter
 * aparte (aria-hidden, para no ensuciar el texto) y el código con tokens
 * coloreados dentro del <pre>.
 *
 * El <pre> conserva EXACTAMENTE el código original: los saltos de línea se
 * emiten como texto ('\n') y los números viven fuera del <pre>. Así el texto
 * del bloque sigue siendo el que se copia.
 */
export const CodigoResaltado = ({ lineas }: ParametrosCodigoResaltado) => (
  <div className='codigo-editor'>
    <div className='codigo-lineas' aria-hidden='true'>
      {lineas.map((_, indice) => (
        <span key={indice}>{indice + 1}</span>
      ))}
    </div>
    <pre>
      <code>
        {lineas.map((tokens, indice) => (
          <Fragment key={indice}>
            {tokens.map((token, posicion) => (
              <span key={posicion} className={`tok-${token.tipo}`}>
                {token.texto}
              </span>
            ))}
            {indice < lineas.length - 1 ? '\n' : ''}
          </Fragment>
        ))}
      </code>
    </pre>
  </div>
)
