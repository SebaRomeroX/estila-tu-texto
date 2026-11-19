// Persistencia en localStorage. Todo el acceso pasa por acá para que el
// manejo de errores (modo privado, cuota llena, JSON corrupto) sea uno solo.

export const CLAVE_ESTILOS = 'estila-tu-texto:estilos'
export const CLAVE_TEXTO = 'estila-tu-texto:texto'

/**
 * Sanea un objeto desconocido (JSON de storage o de un enlace compartido):
 * deja solo las claves conocidas cuyo tipo coincide con el default y completa
 * el resto. Nunca lanza.
 *
 * @param {unknown} guardado
 * @param {Record<string, string>} porDefecto
 * @returns {Record<string, string>}
 */
export function sanearObjeto(guardado, porDefecto) {
  if (typeof guardado !== 'object' || guardado === null) {
    return { ...porDefecto }
  }

  const objeto = /** @type {Record<string, unknown>} */ (guardado)
  /** @type {Record<string, string>} */
  const saneado = {}
  for (const [campo, valorDefecto] of Object.entries(porDefecto)) {
    const valor = objeto[campo]
    // solo claves conocidas y con el mismo tipo que el default
    if (typeof valor === typeof valorDefecto) {
      saneado[campo] = /** @type {string} */ (valor)
    }
  }

  return { ...porDefecto, ...saneado }
}

/**
 * Carga un objeto plano de strings desde localStorage, fusionándolo con los
 * valores por defecto. Es defensivo a propósito: un JSON corrupto, un valor
 * que no es objeto o una clave con tipo incorrecto NUNCA rompen la app, solo
 * caen al default correspondiente.
 *
 * @param {string} clave
 * @param {Record<string, string>} porDefecto
 * @returns {Record<string, string>}
 */
export function cargarObjeto(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave)
    if (!crudo) return { ...porDefecto }

    return sanearObjeto(JSON.parse(crudo), porDefecto)
  } catch {
    // JSON inválido o localStorage bloqueado (modo privado)
    return { ...porDefecto }
  }
}

/**
 * Guarda un objeto plano en localStorage. Si falla (cuota llena, modo privado)
 * se ignora en silencio: persistir es una comodidad, no un requisito para usar
 * la app.
 *
 * @param {string} clave
 * @param {Record<string, string>} valor
 */
export function guardarObjeto(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // sin persistencia, pero la sesión sigue funcionando
  }
}

/**
 * Borra los datos persistidos (texto y estilos). Lo usa el botón "Borrar
 * datos guardados"; igual que el resto, nunca lanza.
 */
export function borrarDatos() {
  try {
    localStorage.removeItem(CLAVE_ESTILOS)
    localStorage.removeItem(CLAVE_TEXTO)
  } catch {
    // storage bloqueado: no hay nada que borrar
  }
}
