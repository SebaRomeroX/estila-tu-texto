### 🎨 Estila Tu Texto

[![CI](https://github.com/SebaRomeroX/estila-tu-texto/actions/workflows/ci.yml/badge.svg)](https://github.com/SebaRomeroX/estila-tu-texto/actions/workflows/ci.yml)

[Demo en Vivo](https://estilatutexto.netlify.app/) · [Código Fuente](https://github.com/SebaRomeroX/estila-tu-texto)

**Experimenta con estilos de texto y obtén el código listo para usar.** Una herramienta visual para diseñar tipografía sin escribir CSS manualmente.

### 🎯 ¿Qué hace?

1. Escribe o pega un texto (o usa el de muestra)
2. Ajusta todos los estilos tipográficos facilmente
3. Ve el resultado exacto en tiempo real
4. Copia el HTML + CSS generado y úsalo en tu proyecto

> > Ideal para diseñadores, maquetadores y devs que quieren resultados rápidos sin pelearse con el CSS.

### 🖼️ Vista Previa

![vista previa](./public/vista_previa.png)

### 🛠️ Tecnologías

- **React** (con Hooks)
- **CSS**
- **Netlify** para despliegue

### ✨ **Control Total de Tipografía**

- ✅ **Familia tipográfica** (select con opciones)
- ✅ **Tamaño** (number input)
- ✅ **Peso**
- ✅ **Color** (color picker)
- ✅ **Interlineado (line-height)**
- ✅ **Espaciado entre letras (letter-spacing)**
- ✅ **Alineación del texto**
- ✅ Las propiedades tipográficas esenciales, sin CSS a mano

### ⚡ **Experiencia en Tiempo Real**

- **Vista previa instantánea** de todos los cambios
- **Código generado al momento** (HTML + CSS)
- **Sin recargas, sin clicks extra**

### 📋 **Código Listo para Usar**

- Botón **"Copiar código"** con un click
- Formato limpio y legible
- HTML semántico con tu texto
- CSS con las propiedades exactas que elegiste

### 🔧 **Flexibilidad Total**

- **Texto editable:** usa el default, escribe algo nuevo o pega otro texto
- **Arquitectura extensible:** diseñada para añadir nuevos estilos sin tocar lógica core

**Componentes Especializados por Tipo de Input**

Fácil de extender: ¿nuevo estilo? solo crea su input y añádelo al estado

### 🚀 Instalación Local

```bash
git clone https://github.com/SebaRomeroX/estila-tu-texto.git
cd estila-tu-texto
npm install
npm run dev
```

**Scripts útiles:** `npm run lint` · `npm test` · `npm run test:coverage` · `npm run build`

### 💡Lecciones Clave

**Diseño pensando en el futuro:** La arquitectura con un solo estado y componentes reutilizables hace que añadir nuevas funcionalidades sea trivial

**Balance en optimización:** A veces queremos que todo sea perfecto desde el día 1, pero la busqueda de la sobreoptimización puede entorpecer el progreso

### 🧠 ¿Qué Motivó el Proyecto?

Estaba experimentando cómo las propiedades tipográficas (fuentes, line-height, letter-spacing) afectan el impacto visual de un sitio. Además, conozco muchos desarrolladores a los que les impacienta estilar texto, así que construí una herramienta que lo hace practico y rápido.

### 🔮 Próximas Mejoras (Ideas)

Añadir más propiedades CSS (text-transform, text-decoration)

Temas predefinidos (combinaciones de estilos)

Historial de estilos recientes

Migrar a Zustand si el estado se vuelve más complejo

### 👨‍💻 Autor

[Seba Romero](https://sebaromerox.github.io/portafolios/)

**Deja una estrella si te resultó útil ⭐**
