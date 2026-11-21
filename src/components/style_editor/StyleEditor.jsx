import { useContext, useEffect, useState } from 'react'
import {
  InputsColorParams,
  InputsNumberParams,
  InputsSelectsParams,
} from '../../InputsParams.js'
import { EstilosContext } from '../../context/estilosContext.js'
import { ESTILOS_POR_DEFECTO } from '../../lib/estilos.js'
import { EVENTO_DATOS_BORRADOS } from '../../lib/persistencia.js'
import { PRESETS, esMismoEstilo, presetActivo } from '../../lib/presets.js'
import {
  agregarPreset,
  cargarPresets,
  guardarPresets,
  quitarPreset,
} from '../../lib/presetsPropios.js'
import { InputNumber } from './InputNumber.jsx'
import { InputSelect } from './InputSelect.jsx'
import { InputColor } from './InputColor.jsx'
import { IndicadorContraste } from './IndicadorContraste.jsx'
import { AvisoFuente } from './AvisoFuente.jsx'
import { SelectorFuente } from './SelectorFuente.jsx'

export const StyleEditor = () => {
  const { estilos, aplicarEstilos } = useContext(EstilosContext)
  const activo = presetActivo(estilos)

  // temas propios: estado local + localStorage. "Borrar datos guardados" los
  // elimina del storage y avisa por evento para que esta lista se recargue.
  const [presetsPropios, setPresetsPropios] = useState(cargarPresets)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    function recargarPresets() {
      setPresetsPropios(cargarPresets())
    }

    window.addEventListener(EVENTO_DATOS_BORRADOS, recargarPresets)
    return () =>
      window.removeEventListener(EVENTO_DATOS_BORRADOS, recargarPresets)
  }, [])

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} e
   */
  function guardarTema(e) {
    e.preventDefault()
    const nombre = nombreNuevo.trim()
    if (!nombre) return

    const nuevos = agregarPreset(presetsPropios, nombre, estilos)
    guardarPresets(nuevos)
    setPresetsPropios(nuevos)
    setNombreNuevo('')
    setMensaje(`Tema «${nombre}» guardado`)
  }

  /**
   * @param {string} nombre
   */
  function eliminarTema(nombre) {
    const nuevos = quitarPreset(presetsPropios, nombre)
    guardarPresets(nuevos)
    setPresetsPropios(nuevos)
    setMensaje(`Tema «${nombre}» eliminado`)
  }

  return (
    <section className='seccion'>
      <h2 className='titulo'>Configuracion</h2>
      <div className='temas'>
        <span className='temas-label'>Temas:</span>
        {PRESETS.map(({ id, nombre, estilos }) => (
          <button
            key={id}
            type='button'
            aria-label={`Aplicar tema ${nombre}`}
            aria-pressed={id === activo}
            onClick={() => aplicarEstilos(estilos)}
          >
            {nombre}
          </button>
        ))}
        <button
          type='button'
          className='temas-reset'
          onClick={() => aplicarEstilos(ESTILOS_POR_DEFECTO)}
        >
          Restablecer estilos <span aria-hidden='true'>↺</span>
        </button>
      </div>

      {presetsPropios.length > 0 && (
        <div className='temas'>
          <span className='temas-label'>Mis temas:</span>
          {presetsPropios.map((preset) => (
            <span key={preset.nombre} className='tema-propio'>
              <button
                type='button'
                aria-label={`Aplicar tema propio ${preset.nombre}`}
                aria-pressed={
                  activo === null && esMismoEstilo(estilos, preset.estilos)
                }
                onClick={() => aplicarEstilos(preset.estilos)}
              >
                {preset.nombre}
              </button>
              <button
                type='button'
                className='tema-propio-borrar'
                aria-label={`Eliminar tema propio ${preset.nombre}`}
                onClick={() => eliminarTema(preset.nombre)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <form className='guardar-tema' onSubmit={guardarTema}>
        <label>
          <span>Guardar tema actual</span>
          <input
            type='text'
            value={nombreNuevo}
            maxLength={40}
            placeholder='Mi tema'
            onChange={(e) => setNombreNuevo(e.target.value)}
          />
        </label>
        <button type='submit' disabled={!nombreNuevo.trim()}>
          Guardar tema
        </button>
        <span className='sr-only' role='status' aria-live='polite'>
          {mensaje}
        </span>
      </form>

      <SelectorFuente />
      <AvisoFuente />
      <div className='inputs-configuracion'>
        <InputNumber elemento={InputsNumberParams.gap} />
        <InputSelect elemento={InputsSelectsParams.align} />
        <InputColor elemento={InputsColorParams.color} />
        <InputColor elemento={InputsColorParams.fondo} />
      </div>
      <IndicadorContraste />
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.peso} />
        <InputNumber elemento={InputsNumberParams.tamaño} />
        <InputNumber elemento={InputsNumberParams.altura} />
        <InputNumber elemento={InputsNumberParams.espacio} />
        <InputNumber elemento={InputsNumberParams.ancho} />
        <InputNumber elemento={InputsNumberParams.escalaTitulo} />
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.transform} />
        <InputSelect elemento={InputsSelectsParams.decoracion} />
        <InputSelect elemento={InputsSelectsParams.estiloLetra} />
      </div>
      <div className='inputs-configuracion'>
        <InputNumber elemento={InputsNumberParams.sangria} />
        <InputNumber elemento={InputsNumberParams.espacioPalabras} />
        <InputSelect elemento={InputsSelectsParams.versalitas} />
        <InputSelect elemento={InputsSelectsParams.corteLinea} />
      </div>
    </section>
  )
}
