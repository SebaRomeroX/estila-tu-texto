import { useContext } from 'react'
import {
  InputsColorParams,
  InputsNumberParams,
  InputsSelectsParams,
} from '../../InputsParams.js'
import { EstilosContext } from '../../context/estilosContext.js'
import { ESTILOS_POR_DEFECTO } from '../../lib/estilos.js'
import { PRESETS, presetActivo } from '../../lib/presets.js'
import { InputNumber } from './InputNumber.jsx'
import { InputSelect } from './InputSelect.jsx'
import { InputColor } from './InputColor.jsx'
import { IndicadorContraste } from './IndicadorContraste.jsx'

export const StyleEditor = () => {
  const { estilos, aplicarEstilos } = useContext(EstilosContext)
  const activo = presetActivo(estilos)

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
      <div className='inputs-configuracion'>
        <InputNumber elemento={InputsNumberParams.gap} />
        <InputSelect elemento={InputsSelectsParams.align} />
        <InputColor elemento={InputsColorParams.color} />
        <InputColor elemento={InputsColorParams.fondo} />
      </div>
      <IndicadorContraste />
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.fuente} />
        <InputSelect elemento={InputsSelectsParams.peso} />
        <InputNumber elemento={InputsNumberParams.tamaño} />
        <InputNumber elemento={InputsNumberParams.altura} />
        <InputNumber elemento={InputsNumberParams.espacio} />
        <InputNumber elemento={InputsNumberParams.ancho} />
      </div>
    </section>
  )
}
