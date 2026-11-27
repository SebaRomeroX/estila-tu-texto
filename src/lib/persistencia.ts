// Persistencia en localStorage. Todo el acceso pasa por acá para que el
// manejo de errores (modo privado, cuota llena, JSON corrupto) sea uno solo.

export const CLAVE_ESTILOS = 'estila-tu-texto:estilos'
export const CLAVE_TEXTO = 'estila-tu-texto:texto'
export const CLAVE_PRESETS = 'estila-tu-texto:presets'

// evento para que la UI recargue lo que dependa del storage tras un borrado
export const EVENTO_DATOS_BORRADOS = 'estila-tu-texto:datos-borrados'

/**
 * Sanea un objeto desconocido (JSON de storage o de un enlace compartido):
 * deja solo las claves conocidas cuyo tipo coincide con el default y completa
 * el resto. Nunca lanza.
 */
export function sanearObjeto<T extends object>(
  guardado: unknown,
  porDefecto: T,
): T {
  if (typeof guardado !== 'object' || guardado === null) {
    return { ...porDefecto }
  }

  const objeto = guardado as Record<string, unknown>
  const saneado: Record<string, unknown> = {}
  for (const [campo, valorDefecto] of Object.entries(porDefecto)) {
    const valor = objeto[campo]
    // solo claves conocidas y con el mismo tipo que el default
    if (typeof valor === typeof valorDefecto) {
      saneado[campo] = valor
    }
  }

  return { ...porDefecto, ...saneado }
}

/**
 * Carga un objeto plano de strings desde localStorage, fusionándolo con los
 * valores por defecto. Es defensivo a propósito: un JSON corrupto, un valor
 * que no es objeto o una clave con tipo incorrecto NUNCA rompen la app, solo
 * caen al default correspondiente.
 */
export function cargarObjeto<T extends object>(
  clave: string,
  porDefecto: T,
): T {
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
 */
export function guardarObjeto(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // sin persistencia, pero la sesión sigue funcionando
  }
}

/**
 * Borra los datos persistidos (texto, estilos y temas propios). Lo usa el
 * botón "Borrar datos guardados"; igual que el resto, nunca lanza. Avisa por
 * evento para que la UI recargue lo que tenga en memoria (temas propios).
 */
export function borrarDatos(): void {
  try {
    localStorage.removeItem(CLAVE_ESTILOS)
    localStorage.removeItem(CLAVE_TEXTO)
    localStorage.removeItem(CLAVE_PRESETS)
  } catch {
    // storage bloqueado: no hay nada que borrar
  }

  window.dispatchEvent(new Event(EVENTO_DATOS_BORRADOS))
}
