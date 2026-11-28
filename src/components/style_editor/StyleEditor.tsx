import { useContext, useEffect, useState } from 'react'
import {
  InputsColorParams,
  InputsNumberParams,
  InputsSelectsParams,
} from '../../InputsParams'
import { EstilosContext } from '../../context/estilosContext'
import { IdiomaContext } from '../../context/idiomaContext'
import { ESTILOS_POR_DEFECTO } from '../../lib/estilos'
import { EVENTO_DATOS_BORRADOS } from '../../lib/persistencia'
import { PRESETS, esMismoEstilo, presetActivo } from '../../lib/presets'
import {
  agregarPreset,
  cargarPresets,
  guardarPresets,
  quitarPreset,
} from '../../lib/presetsPropios'
import { InputNumber } from './InputNumber'
import { InputSelect } from './InputSelect'
import { InputColor } from './InputColor'
import { InputColorPropio } from './InputColorPropio'
import {
  IndicadorContraste,
  IndicadorContrasteSeleccion,
  IndicadorContrasteSubtitulo,
  IndicadorContrasteTitulo,
} from './IndicadorContraste'
import { AvisoFuente } from './AvisoFuente'
import { SelectorFuente } from './SelectorFuente'
import type { Estilos } from '../../types'
import type { FormEvent } from 'react'

/**
 * Resumen corto de un estado, usado como nombre sugerido al guardar un tema.
 */
function resumenEstilos(estilos: Estilos): string {
  const fuente = estilos.family.split(',')[0].trim()
  return `${estilos.color} / ${estilos.background} · ${fuente} · ${estilos.size}em`
}

/**
 * Nombre por defecto de un tema: el número del tema que se va a guardar y el
 * resumen del estilo actual. El usuario puede reemplazarlo por el suyo.
 */
function nombreSugerido(estilos: Estilos, numero: number): string {
  return `${numero}. ${resumenEstilos(estilos)}`
}

export const StyleEditor = () => {
  const {
    estilos,
    aplicarEstilos,
    puedeDeshacer,
    puedeRehacer,
    deshacer,
    rehacer,
  } = useContext(EstilosContext)
  const { t } = useContext(IdiomaContext)
  const activo = presetActivo(estilos)

  // temas propios: estado local + localStorage. "Borrar datos guardados" los
  // elimina del storage y avisa por evento para que esta lista se recargue.
  const [presetsPropios, setPresetsPropios] = useState(cargarPresets)
  // null = el usuario no tocó el nombre: se muestra el sugerido, que sigue
  // cambiando con el estilo actual. Al escribir, su valor manda.
  const [nombreNuevo, setNombreNuevo] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const numeroTema = presetsPropios.length + 1
  const valorNombre = nombreNuevo ?? nombreSugerido(estilos, numeroTema)

  useEffect(() => {
    function recargarPresets() {
      setPresetsPropios(cargarPresets())
    }

    window.addEventListener(EVENTO_DATOS_BORRADOS, recargarPresets)
    return () =>
      window.removeEventListener(EVENTO_DATOS_BORRADOS, recargarPresets)
  }, [])

  function guardarTema(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nombre = valorNombre.trim()
    if (!nombre) return

    const nuevos = agregarPreset(presetsPropios, nombre, estilos)
    guardarPresets(nuevos)
    setPresetsPropios(nuevos)
    setNombreNuevo(null)
    setMensaje(t('Tema «{nombre}» guardado', { nombre }))
  }

  function eliminarTema(nombre: string) {
    const nuevos = quitarPreset(presetsPropios, nombre)
    guardarPresets(nuevos)
    setPresetsPropios(nuevos)
    setMensaje(t('Tema «{nombre}» eliminado', { nombre }))
  }

  return (
    <section className='seccion'>
      <h2 className='titulo'>{t('Configuracion')}</h2>
      <div className='temas'>
        <label className='temas-selector'>
          <span>{t('Temas:')}</span>
          <select
            value={activo ?? ''}
            onChange={(e) => {
              const preset = PRESETS.find(({ id }) => id === e.target.value)
              if (preset) aplicarEstilos(preset.estilos)
            }}
          >
            <option value='' disabled>
              {t('Personalizado')}
            </option>
            {PRESETS.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {t(nombre)}
              </option>
            ))}
          </select>
        </label>
        <button
          type='button'
          className='temas-reset'
          onClick={() => aplicarEstilos(ESTILOS_POR_DEFECTO)}
        >
          {t('Restablecer estilos')} <span aria-hidden='true'>↺</span>
        </button>
      </div>

      <div className='deshacer-rehacer'>
        <button type='button' onClick={deshacer} disabled={!puedeDeshacer}>
          <span aria-hidden='true'>↶</span> {t('Deshacer')}
        </button>
        <button type='button' onClick={rehacer} disabled={!puedeRehacer}>
          <span aria-hidden='true'>↷</span> {t('Rehacer')}
        </button>
      </div>

      {presetsPropios.length > 0 && (
        <div className='temas'>
          <span className='temas-label'>{t('Mis temas:')}</span>
          {presetsPropios.map((preset) => (
            <span key={preset.nombre} className='tema-propio'>
              <button
                type='button'
                aria-label={t('Aplicar tema propio {nombre}', {
                  nombre: preset.nombre,
                })}
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
                aria-label={t('Eliminar tema propio {nombre}', {
                  nombre: preset.nombre,
                })}
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
          <span>{t('Guardar tema actual')}</span>
          <input
            type='text'
            value={valorNombre}
            maxLength={64}
            placeholder={t('Mi tema')}
            onChange={(e) => setNombreNuevo(e.target.value)}
          />
        </label>
        <button type='submit' disabled={!valorNombre.trim()}>
          {t('Guardar tema')}
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
        <InputSelect elemento={InputsSelectsParams.fondoTransparente} />
        <InputColor elemento={InputsColorParams.fondo} />
      </div>
      {estilos.fondoTransparente === 'si' && (
        <p className='aviso-fondo'>
          {t(
            'Con fondo transparente, «Color fondo» solo se usa como referencia de contraste: el bloque y la imagen se exportan sin fondo.',
          )}
        </p>
      )}
      <IndicadorContraste />
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.peso} />
        <InputNumber elemento={InputsNumberParams.tamaño} />
        <InputNumber elemento={InputsNumberParams.altura} />
        <InputNumber elemento={InputsNumberParams.espacio} />
        <InputNumber elemento={InputsNumberParams.ancho} />
        <InputNumber elemento={InputsNumberParams.escalaTitulo} />
        <InputNumber elemento={InputsNumberParams.escalaSubtitulo} />
        <InputNumber elemento={InputsNumberParams.paddingVertical} />
        <InputNumber elemento={InputsNumberParams.paddingHorizontal} />
        <InputNumber elemento={InputsNumberParams.opacidad} />
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.borde} />
        {estilos.borde === 'si' && (
          <>
            <InputNumber elemento={InputsNumberParams.bordeAncho} />
            <InputColor elemento={InputsColorParams.bordeColor} />
            <InputNumber elemento={InputsNumberParams.bordeRadio} />
          </>
        )}
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.contorno} />
        {estilos.contorno === 'si' && (
          <>
            <InputNumber elemento={InputsNumberParams.contornoAncho} />
            <InputColor elemento={InputsColorParams.contornoColor} />
          </>
        )}
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.animacion} />
        <InputSelect elemento={InputsSelectsParams.glass} />
      </div>
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.tituloFamilia} />
        <InputSelect elemento={InputsSelectsParams.tituloPeso} />
        <InputColorPropio
          etiqueta='Color título'
          campo='tituloColor'
          etiquetaPropio='Color propio título'
        />
      </div>
      <IndicadorContrasteTitulo />
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.subtituloFamilia} />
        <InputSelect elemento={InputsSelectsParams.subtituloPeso} />
        <InputColorPropio
          etiqueta='Color subtítulo'
          campo='subtituloColor'
          etiquetaPropio='Color propio subtítulo'
        />
      </div>
      <IndicadorContrasteSubtitulo />
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
        <InputSelect elemento={InputsSelectsParams.letraCapitular} />
        <InputSelect elemento={InputsSelectsParams.sombra} />
      </div>
      {estilos.sombra === 'personalizada' && (
        <div className='inputs-configuracion'>
          <InputNumber elemento={InputsNumberParams.sombraX} />
          <InputNumber elemento={InputsNumberParams.sombraY} />
          <InputNumber elemento={InputsNumberParams.sombraDifuminado} />
          <InputColor elemento={InputsColorParams.sombraColor} />
        </div>
      )}
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.seleccion} />
        {estilos.seleccion === 'personalizada' && (
          <>
            <InputColor elemento={InputsColorParams.seleccionFondo} />
            <InputColor elemento={InputsColorParams.seleccionTexto} />
          </>
        )}
      </div>
      <IndicadorContrasteSeleccion />
      <div className='inputs-configuracion'>
        <InputSelect elemento={InputsSelectsParams.degradado} />
        {estilos.degradado === 'degradado' && (
          <>
            <InputColor elemento={InputsColorParams.degradadoInicio} />
            <InputColor elemento={InputsColorParams.degradadoFin} />
          </>
        )}
        <InputSelect elemento={InputsSelectsParams.columnas} />
      </div>
    </section>
  )
}
