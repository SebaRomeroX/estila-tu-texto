import { TEXTO_POR_DEFECTO } from './texto.js'

/**
 * Textos de arranque para probar estilos sin tener que escribir. Son datos
 * puros: cada plantilla completa TODOS los campos del dominio Texto.
 *
 * @type {import('../types.js').PlantillaTexto[]}
 */
export const PLANTILLAS = [
  {
    id: 'ensayo',
    nombre: 'Ensayo',
    texto: {
      titulo: 'Elogio de la lectura lenta',
      parrafo1:
        'Leer despacio no es un defecto: es una forma de resistir la prisa que nos impone la pantalla. Cuando el ojo se detiene, el pensamiento tiene tiempo de discutir con lo que lee.',
      parrafo2:
        'Una frase puede abrir una habitación entera. La lectura veloz las atraviesa sin mirar los muebles; la lectura lenta se sienta, enciende la luz y pregunta quién vivió allí antes.',
      subtitulo: 'Un ritmo que se elige',
      parrafo3:
        'No se trata de leer menos, sino de elegir mejor dónde detenerse. Cada párrafo es una invitación a quedarse un poco más.',
    },
  },
  {
    id: 'blog',
    nombre: 'Blog',
    texto: {
      titulo: 'Cómo empezar a escribir todos los días',
      parrafo1:
        'La constancia vence al talento cuando el talento decide descansar. Escribir todos los días no exige una obra maestra: exige una cita con la página.',
      parrafo2:
        'Elige una hora, un lugar y una frase de arranque. Lo importante no es que salga bien, sino que salga. Después, cuando el hábito ya no duela, llega la corrección.',
      subtitulo: 'Empieza pequeño',
      parrafo3:
        'Diez minutos al día son suficientes para sostener el hilo. Al cabo de un mes tendrás algo que no existía: una voz propia en movimiento.',
    },
  },
  {
    id: 'cuento',
    nombre: 'Cuento',
    texto: {
      titulo: 'La casa junto al mar',
      parrafo1:
        'La casa llevaba años vacía, pero cada invierno alguien encendía una luz en la ventana del segundo piso. Los vecinos habían dejado de preguntarse quién era.',
      parrafo2:
        'Una noche de tormenta, la luz no apareció. Al amanecer, la puerta estaba abierta y en la mesa había dos tazas de café todavía tibias.',
      subtitulo: 'Lo que dejó la marea',
      parrafo3:
        'Nadie volvió a ver la casa igual. El mar, en cambio, siguió subiendo y bajando, como si nada hubiera pasado.',
    },
  },
  {
    id: 'carta',
    nombre: 'Carta',
    texto: {
      titulo: 'Carta a quien empieza',
      parrafo1:
        'Querido lector: si estás aquí, probablemente ya diste el primer paso, que es el más difícil. Lo demás se aprende mientras se camina.',
      parrafo2:
        'No esperes tener las palabras perfectas ni el estilo resuelto. Escribe con lo que tienes hoy; mañana tendrás otra versión de ti para corregirlo.',
      subtitulo: 'Un consejo antes de despedirme',
      parrafo3:
        'Guarda lo que escribas, incluso lo que te dé vergüenza. Con el tiempo descubrirás que esas páginas eran el mapa de algo que todavía no sabías nombrar.',
    },
  },
]

/**
 * Nombre de la plantilla que coincide exactamente con el texto actual, o
 * null si el texto fue editado. Sirve para el <select> y para los tests.
 *
 * @param {import('../types.js').Texto} texto
 * @returns {string | null}
 */
export function plantillaActiva(texto) {
  const campos = /** @type {Array<keyof import('../types.js').Texto>} */ (
    Object.keys(TEXTO_POR_DEFECTO)
  )

  const plantilla = PLANTILLAS.find(({ texto: candidato }) =>
    campos.every((campo) => candidato[campo] === texto[campo]),
  )

  return plantilla?.id ?? null
}
