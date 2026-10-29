import { useContext, useEffect, useState } from "react"
import { EstilosContext } from "../../context/estilosContext.js"

export const InputNumber = ({ elemento }) => {
  const { label, min, max, step, campo } = elemento
  const { estilos, actualizarEstilos } = useContext(EstilosContext)

  const valorObtenido = estilos[campo]

  // draft: lo que se muestra mientras se tipea (puede estar vacío a medio
  // escribir). contexto: siempre recibe un número válido dentro de [min, max].
  const [draft, setDraft] = useState(String(valorObtenido))

  // si el estado cambia por fuera (reset/presets futuros), reflejarlo aquí.
  // se compara en números para no pisar un "1." a medio tipear.
  useEffect(() => {
    setDraft(prev => (
      Number(prev) === Number(valorObtenido) ? prev : String(valorObtenido)
    ))
  }, [valorObtenido])

  function handleChange (e) {
    const raw = e.target.value
    setDraft(raw)

    const numero = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(numero)) return
    if (numero < min || numero > max) return

    actualizarEstilos(campo, String(numero))
  }

  function handleBlur () {
    const numero = Number(draft)
    const valido = draft.trim() !== '' && Number.isFinite(numero)

    // en rango se normaliza; fuera de rango se clampa; vacío/inválido se
    // revierte al último valor válido del contexto (nunca escribe basura)
    const objetivo = valido
      ? Math.min(Math.max(numero, min), max)
      : Number(estilos[campo])

    actualizarEstilos(campo, String(objetivo))
    setDraft(String(objetivo))
  }

  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
      />
    </label>
  )
}
