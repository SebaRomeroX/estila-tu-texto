import { InputsColorParams, InputsNumberParams, InputsSelectsParams } from '../../InputsParams.js'
import { InputNumber } from './InputNumber.jsx'
import { InputSelect } from './InputSelect.jsx'
import { InputColor } from './InputColor.jsx'

export const StyleEditor = () => {
  return (
    <section className='seccion'>
      <h2 className='titulo'>Configuracion</h2>
      <div className='inputs-configuracion'>
        <InputNumber elemento={InputsNumberParams.gap} />
        <InputSelect elemento={InputsSelectsParams.align} />
        <InputColor elemento={InputsColorParams.color} />
        <InputColor elemento={InputsColorParams.fondo} />
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.fuente} />
        <InputSelect elemento={InputsSelectsParams.peso} />
        <InputNumber elemento={InputsNumberParams.tamaño} />
        <InputNumber elemento={InputsNumberParams.altura} />
        <InputNumber elemento={InputsNumberParams.espacio} />
      </div>
    </section>
  )
}