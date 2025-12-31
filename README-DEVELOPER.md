# 🛠️ StatSim Pro - Documentación Técnica para Desarrolladores

> Guía exhaustiva de arquitectura, módulos y desarrollo del proyecto.

---

## 📋 Tabla de Contenidos

1. [Introducción](#-introducción)
2. [Requisitos Previos](#-requisitos-previos)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Arquitectura](#-arquitectura)
5. [Módulos del Sistema](#-módulos-del-sistema)
6. [Flujo de Datos](#-flujo-de-datos)
7. [Guía de Desarrollo](#-guía-de-desarrollo)
8. [Patrones de Diseño](#-patrones-de-diseño)
9. [Seguridad](#-seguridad)
10. [Testing](#-testing)
11. [Despliegue](#-despliegue)
12. [Troubleshooting](#-troubleshooting)

---

## 🎯 Introducción

**StatSim Pro** es una aplicación web de simulación y análisis estadístico construida con **JavaScript Vanilla** siguiendo una arquitectura empresarial modular. No utiliza frameworks como React o Vue, lo que la hace ligera y fácil de entender.

### ¿Por qué JavaScript Vanilla?

- **Sin dependencias pesadas**: No necesitas npm install ni node_modules
- **Rendimiento óptimo**: Sin overhead de frameworks
- **Aprendizaje directo**: Entiendes JavaScript puro, no abstracciones
- **Portabilidad**: Funciona en cualquier servidor web estático

### Características Técnicas

| Característica | Implementación |
|----------------|----------------|
| Arquitectura | Modular ES6 Modules |
| Estado | Proxy reactivo centralizado |
| Seguridad | Protección XSS integrada |
| Documentación | JSDoc en todas las funciones |
| Estilos | CSS Variables + BEM |
| Gráficos | Canvas API nativo |
| Reportes | jsPDF (carga dinámica) |

---

## 📦 Requisitos Previos

### Para Desarrollo

```bash
# Solo necesitas un navegador moderno y un servidor local
# Opción 1: Extensión Live Server de VS Code
# Opción 2: Python
python -m http.server 8000

# Opción 3: Node.js
npx serve .

# Opción 4: PHP
php -S localhost:8000
```

### Navegadores Soportados

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

> ⚠️ **Importante**: El proyecto usa ES6 Modules (`type="module"`), por lo que **debe** ejecutarse desde un servidor web, no abriendo el archivo HTML directamente.

---

## 📁 Estructura del Proyecto

```
statsim-pro/
│
├── 📄 index.html                    # Punto de entrada HTML
├── 📄 README-DEVELOPER.md           # Esta documentación
├── 📄 README-USER.md                # Manual de usuario
│
├── 📁 styles/                       # Estilos CSS
│   └── 📄 main.css                  # Hoja de estilos principal
│
└── 📁 src/                          # Código fuente JavaScript
    │
    ├── 📄 app.js                    # 🎯 COMPOSITION ROOT
    │
    ├── 📁 core/                     # Núcleo del sistema
    │   ├── 📄 state.js              # Estado reactivo (Proxy)
    │   └── 📄 config.js             # Configuraciones globales
    │
    ├── 📁 logic/                    # Lógica de negocio (PURA)
    │   ├── 📄 statistics.js         # Cálculos estadísticos
    │   ├── 📄 normality.js          # Pruebas de normalidad
    │   ├── 📄 correlation.js        # Análisis de correlación
    │   ├── 📄 generator.js          # Generador de datos
    │   └── 📄 interpretations.js    # Interpretaciones textuales
    │
    ├── 📁 ui/                       # Capa de presentación
    │   ├── 📄 dom-manager.js        # Manipulación del DOM
    │   ├── 📄 toast.js              # Sistema de notificaciones
    │   ├── 📄 navigation.js         # Navegación SPA
    │   ├── 📄 tables.js             # Renderizado de tablas
    │   ├── 📄 forms.js              # Manejo de formularios
    │   └── 📄 charts.js             # Gráficos con Canvas
    │
    ├── 📁 services/                 # Servicios externos
    │   ├── 📄 csv-parser.js         # Parser de archivos CSV
    │   ├── 📄 file-handler.js       # Descarga/carga de archivos
    │   └── 📄 pdf-report.js         # Generación de reportes PDF
    │
    └── 📁 utils/                    # Utilidades compartidas
        ├── 📄 xss-protection.js     # Sanitización de datos
        ├── 📄 helpers.js            # Funciones auxiliares
        └── 📄 validators.js         # Validaciones de entrada
```

### Convención de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos | kebab-case | `dom-manager.js` |
| Funciones | camelCase | `calcularCorrelacion()` |
| Constantes | SCREAMING_SNAKE | `CONFIG_DEFAULT` |
| Clases CSS | kebab-case | `.config-card` |
| IDs HTML | camelCase | `#bodyPruebas` |

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (Estructura HTML)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         app.js                              │
│                   (Composition Root)                        │
│         Importa y conecta todos los módulos                 │
│         NO contiene lógica de negocio                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│     /ui/      │    │   /logic/     │    │  /services/   │
│ Presentación  │    │   Negocio     │    │   Externos    │
│               │    │               │    │               │
│ - DOM         │◄───│ - Cálculos    │    │ - CSV         │
│ - Eventos     │    │ - Algoritmos  │    │ - Archivos    │
│ - Renderizado │    │ - Validación  │    │ - PDF         │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        /core/                               │
│              Estado (state.js) + Config                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        /utils/                              │
│         Helpers, Validators, XSS Protection                 │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada módulo tiene una única responsabilidad
2. **Dependencias Unidireccionales**: UI → Logic → Utils (nunca al revés)
3. **Funciones Puras en Logic**: Sin efectos secundarios, sin DOM
4. **Estado Centralizado**: Un solo lugar para el estado de la aplicación

---

## 📚 Módulos del Sistema

### 1. Core - Núcleo

#### `state.js` - Estado Reactivo

```javascript
// Importar
import { store } from './core/state.js';

// Leer estado
const datos = store.getState().datosCargados;

// Actualizar estado (dispara re-renders automáticos)
store.setState({ datosCargados: nuevosData });

// Suscribirse a cambios
store.subscribe('datosCargados', (nuevoValor) => {
    console.log('Datos actualizados:', nuevoValor);
});
```

**¿Cómo funciona?**

El estado usa un `Proxy` de JavaScript que intercepta todas las escrituras. Cuando cambias un valor, automáticamente:

1. Actualiza el estado interno
2. Notifica a todos los suscriptores
3. Actualiza elementos con `data-bind` en el HTML

```javascript
// Ejemplo simplificado del Proxy
const estado = new Proxy(objetoEstado, {
    set(target, propiedad, valor) {
        target[propiedad] = valor;
        notificarSuscriptores(propiedad, valor);
        return true;
    }
});
```

#### `config.js` - Configuración Global

```javascript
import { CONFIG, MENSAJES, TEXTOS } from './core/config.js';

// Usar constantes
console.log(CONFIG.APP.NOMBRE);        // "StatSim Pro"
console.log(CONFIG.ESTADISTICA.ALPHA); // 0.05

// Mensajes de error
console.log(MENSAJES.ERRORES.DATOS_REQUERIDOS);
```

---

### 2. Logic - Lógica de Negocio

> ⚠️ **Regla de Oro**: Los módulos en `/logic/` NUNCA tocan el DOM. Son funciones puras que reciben datos y retornan resultados.

#### `statistics.js` - Estadísticas Descriptivas

```javascript
import { calcularDescriptivas, calcularPercentil } from './logic/statistics.js';

const datos = [23, 45, 67, 89, 12, 34, 56, 78];

// Estadísticas completas
const stats = calcularDescriptivas(datos);
console.log(stats);
// {
//   n: 8,
//   media: 50.5,
//   mediana: 50.5,
//   moda: null,
//   desviacionEstandar: 25.67,
//   varianza: 658.86,
//   minimo: 12,
//   maximo: 89,
//   rango: 77
// }

// Percentil específico
const p75 = calcularPercentil(datos, 75); // 72.25
```

#### `normality.js` - Pruebas de Normalidad

```javascript
import { pruebaDeNormalidad } from './logic/normality.js';

const datos = [/* ... array de números ... */];

const resultado = pruebaDeNormalidad(datos);
console.log(resultado);
// {
//   prueba: "Shapiro-Wilk",     // o "Kolmogorov-Smirnov" si n >= 50
//   estadistico: 0.9823,
//   pValor: 0.4521,
//   esNormal: true,             // pValor > 0.05
//   n: 30
// }
```

**¿Qué prueba usa?**

| Tamaño de Muestra | Prueba |
|-------------------|--------|
| n < 50 | Shapiro-Wilk |
| n ≥ 50 | Kolmogorov-Smirnov |

#### `correlation.js` - Análisis de Correlación

```javascript
import { calcularCorrelacion } from './logic/correlation.js';

const var1 = [1, 2, 3, 4, 5];
const var2 = [2, 4, 5, 4, 5];

const resultado = calcularCorrelacion(var1, var2);
console.log(resultado);
// {
//   coeficiente: 0.8165,
//   pValor: 0.0918,
//   tipoCorrelacion: "Pearson",  // o "Spearman" si no son normales
//   normalidad1: { ... },
//   normalidad2: { ... },
//   interpretacion: {
//     magnitud: "Alta",
//     direccion: "Positiva",
//     texto: "Existe una correlación alta positiva..."
//   }
// }
```

#### `generator.js` - Generación de Datos

```javascript
import { generarBaseDatos } from './logic/generator.js';

const configuracion = {
    tamanoMuestra: 100,
    pruebas: [
        { nombre: "Ansiedad", numItems: 20, media: 50, desviacion: 10, minimo: 20, maximo: 100 }
    ],
    sociodemograficos: [
        { categoria: "Edad", promedio: 25, desviacion: 5, minimo: 18, maximo: 65, decimales: 0 }
    ]
};

const datos = generarBaseDatos(configuracion);
// Retorna array de objetos con datos simulados
```

#### `interpretations.js` - Generación de Texto

```javascript
import { 
    generarMarcoMetodologico,
    generarInterpretacionCorrelacion 
} from './logic/interpretations.js';

const marco = generarMarcoMetodologico("Ansiedad", "Rendimiento", "estudiantes", "universidad");
// {
//   preguntaInvestigacion: "¿Cuál es la relación entre...",
//   objetivoGeneral: "Determinar la relación...",
//   hipotesis: {
//     hipotesisInvestigador: "Existe relación significativa...",
//     hipotesisNula: "No existe relación significativa..."
//   }
// }
```

---

### 3. UI - Interfaz de Usuario

#### `dom-manager.js` - Manipulación del DOM

```javascript
import { 
    obtenerElemento, 
    establecerTexto, 
    agregarClase,
    delegarEvento 
} from './ui/dom-manager.js';

// Obtener elemento (con cache automático)
const boton = obtenerElemento('#miBoton');

// Establecer texto (con protección XSS automática)
establecerTexto('#resultado', 'Valor: 42');

// Clases CSS
agregarClase('#card', 'activa');

// Event delegation (eficiente para elementos dinámicos)
delegarEvento(document.body, 'click', '.btn-eliminar', (evento, elemento) => {
    console.log('Click en:', elemento);
});
```

#### `toast.js` - Notificaciones

```javascript
import { toastExito, toastError, toastAdvertencia } from './ui/toast.js';

toastExito('Operación completada');
toastError('Algo salió mal');
toastAdvertencia('Revisa los datos');
```

#### `charts.js` - Gráficos

```javascript
import { crearGraficoDispersion } from './ui/charts.js';

const grafico = crearGraficoDispersion('miCanvas', datosX, datosY, {
    titulo: 'Correlación X vs Y',
    etiquetaX: 'Variable X',
    etiquetaY: 'Variable Y',
    mostrarLinea: true  // Línea de tendencia
});

// Actualizar datos
grafico.actualizar(nuevosX, nuevosY);

// Destruir
grafico.destroy();
```

---

### 4. Services - Servicios Externos

#### `csv-parser.js` - Manejo de CSV

```javascript
import { parsearCSV, generarCSV } from './services/csv-parser.js';

// Parsear CSV string
const datos = parsearCSV(textoCSV);
// [{ col1: 'valor1', col2: 'valor2' }, ...]

// Generar CSV desde datos
const csv = generarCSV(arrayDeObjetos);
```

#### `file-handler.js` - Archivos

```javascript
import { cargarArchivoCSV, descargarCSV } from './services/file-handler.js';

// Cargar archivo
const resultado = await cargarArchivoCSV(archivoInput);
if (resultado.exito) {
    console.log(resultado.datos);
}

// Descargar
descargarCSV(datos, 'mi_archivo');
```

#### `pdf-report.js` - Reportes PDF

```javascript
import { descargarReportePDF } from './services/pdf-report.js';

await descargarReportePDF({
    var1: 'Ansiedad',
    var2: 'Rendimiento',
    correlacion: resultadoCorrelacion,
    marco: marcoMetodologico
});
```

---

### 5. Utils - Utilidades

#### `xss-protection.js` - Seguridad

```javascript
import { escapeHtml, sanitizeUrl } from './utils/xss-protection.js';

// Escapar HTML (previene inyección)
const seguro = escapeHtml('<script>alert("hack")</script>');
// "&lt;script&gt;alert("hack")&lt;/script&gt;"

// Validar URLs
const url = sanitizeUrl('javascript:alert(1)'); // null (bloqueado)
const url2 = sanitizeUrl('https://ejemplo.com'); // "https://ejemplo.com"
```

#### `validators.js` - Validaciones

```javascript
import { validarConfiguracionPrueba, validarTamanoMuestral } from './utils/validators.js';

const resultado = validarTamanoMuestral(50);
// { valido: true, errores: [], advertencias: [] }

const resultado2 = validarTamanoMuestral(5);
// { valido: false, errores: ['El tamaño mínimo es 10'], advertencias: [] }
```

#### `helpers.js` - Funciones Auxiliares

```javascript
import { formatearNumero, debounce, generateUniqueId } from './utils/helpers.js';

formatearNumero(3.14159265, 2);  // "3.14"
formatearNumero(1234567, 0);     // "1,234,567"

// Debounce para optimizar eventos
const buscarOptimizado = debounce((texto) => {
    console.log('Buscando:', texto);
}, 300);

// ID único
const id = generateUniqueId(); // "uid_1703847562345_abc123"
```

---

## 🔄 Flujo de Datos

### Ejemplo: Generar Base de Datos

```
┌──────────────────┐
│  Usuario hace    │
│  click en        │
│  "Generar"       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    app.js        │
│  (Orquestador)   │
│                  │
│ 1. Captura evento│
│ 2. Lee config UI │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  validators.js   │
│                  │
│ Valida inputs    │
│ Retorna errores  │
└────────┬─────────┘
         │
         ▼ (si válido)
┌──────────────────┐
│  generator.js    │
│                  │
│ Genera datos     │
│ estadísticos     │
│ (función pura)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   state.js       │
│                  │
│ Guarda datos     │
│ en estado        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   tables.js      │
│                  │
│ Renderiza tabla  │
│ con datos        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   toast.js       │
│                  │
│ Muestra mensaje  │
│ de éxito         │
└──────────────────┘
```

---

## 👨‍💻 Guía de Desarrollo

### Agregar una Nueva Función Estadística

1. **Crear la función en `/logic/`**:

```javascript
// src/logic/statistics.js

/**
 * Calcula el coeficiente de variación
 * @param {number[]} datos - Array de números
 * @returns {number} Coeficiente de variación (%)
 */
export function calcularCoeficienteVariacion(datos) {
    const stats = calcularDescriptivas(datos);
    if (stats.media === 0) return 0;
    return (stats.desviacionEstandar / stats.media) * 100;
}
```

2. **Importar en `app.js`**:

```javascript
import { calcularCoeficienteVariacion } from './logic/statistics.js';
```

3. **Usar en el flujo**:

```javascript
const cv = calcularCoeficienteVariacion(datos);
establecerTexto('#coefVariacion', `CV: ${formatearNumero(cv, 2)}%`);
```

### Agregar un Nuevo Componente UI

1. **Crear módulo en `/ui/`**:

```javascript
// src/ui/modal.js

import { obtenerElemento, agregarClase, removerClase } from './dom-manager.js';

export function abrirModal(contenido) {
    const modal = obtenerElemento('#modal');
    establecerHTML('#modalBody', contenido);
    agregarClase(modal, 'visible');
}

export function cerrarModal() {
    removerClase(obtenerElemento('#modal'), 'visible');
}
```

2. **Agregar estilos en `main.css`**:

```css
.modal.visible {
    display: flex;
}
```

3. **Importar y usar en `app.js`**:

```javascript
import { abrirModal, cerrarModal } from './ui/modal.js';
```

---

## 🎨 Patrones de Diseño

### 1. Proxy Pattern (Estado)

```javascript
// El estado usa Proxy para reactividad
const handler = {
    set(target, prop, value) {
        const oldValue = target[prop];
        target[prop] = value;
        
        // Notificar cambios
        listeners.forEach(fn => fn(prop, value, oldValue));
        
        return true;
    }
};

const state = new Proxy({}, handler);
```

### 2. Observer Pattern (Suscripciones)

```javascript
// Suscribirse a cambios específicos
store.subscribe('datosCargados', callback);
```

### 3. Module Pattern (ES6 Modules)

```javascript
// Cada archivo es un módulo aislado
// Solo se exporta lo necesario
export function publica() { }
function privada() { }  // No accesible desde fuera
```

### 4. Factory Pattern (Creación de elementos)

```javascript
// dom-manager.js
export function crearElemento(tag, opciones) {
    const el = document.createElement(tag);
    // ... configurar
    return el;
}
```

### 5. Delegation Pattern (Eventos)

```javascript
// Un solo listener para múltiples elementos
delegarEvento(document.body, 'click', '.btn-delete', handler);
```

---

## 🔒 Seguridad

### Protección XSS Implementada

| Amenaza | Protección |
|---------|------------|
| Inyección HTML | `escapeHtml()` escapa `<`, `>`, `&`, `"`, `'` |
| URLs maliciosas | `sanitizeUrl()` bloquea `javascript:`, `data:` |
| Atributos | `sanitizeAttribute()` valida nombres y valores |
| Contenido dinámico | `textContent` en lugar de `innerHTML` |

### Ejemplo de Uso Seguro

```javascript
// ❌ INSEGURO
element.innerHTML = userInput;

// ✅ SEGURO
import { setSafeTextContent } from './utils/xss-protection.js';
setSafeTextContent(element, userInput);
```

---

## 🧪 Testing

### Testing Manual

1. **Abrir consola del navegador** (F12)
2. **Probar funciones directamente**:

```javascript
// Las funciones de logic/ son puras, fáciles de testear
import { calcularDescriptivas } from './src/logic/statistics.js';

const resultado = calcularDescriptivas([1, 2, 3, 4, 5]);
console.assert(resultado.media === 3, 'Media incorrecta');
```

### Estructura para Tests Futuros

```javascript
// tests/statistics.test.js (ejemplo con Jest)
import { calcularDescriptivas } from '../src/logic/statistics.js';

describe('calcularDescriptivas', () => {
    test('calcula media correctamente', () => {
        const datos = [1, 2, 3, 4, 5];
        const resultado = calcularDescriptivas(datos);
        expect(resultado.media).toBe(3);
    });
    
    test('maneja arrays vacíos', () => {
        expect(() => calcularDescriptivas([])).toThrow();
    });
});
```

---

## 🚀 Despliegue

### Opción 1: Servidor Estático

```bash
# Subir todos los archivos a cualquier hosting estático
# - GitHub Pages
# - Netlify
# - Vercel
# - Firebase Hosting
```

### Opción 2: GitHub Pages

```bash
# 1. Crear repositorio en GitHub
# 2. Subir archivos
# 3. Settings > Pages > Branch: main > Save
# URL: https://tuusuario.github.io/statsim-pro/
```

### Opción 3: Netlify (Drag & Drop)

1. Ir a [netlify.com](https://netlify.com)
2. Arrastrar la carpeta del proyecto
3. ¡Listo!

---

## 🐛 Troubleshooting

### Error: "Cannot use import statement outside a module"

**Causa**: Abriste el HTML directamente en el navegador.

**Solución**: Usa un servidor local:
```bash
python -m http.server 8000
# Luego abre http://localhost:8000
```

### Error: "CORS policy"

**Causa**: Intentas cargar recursos desde otro dominio.

**Solución**: Asegúrate de que todos los archivos estén en el mismo origen.

### Los gráficos no se muestran

**Causa**: El canvas no tiene dimensiones.

**Solución**: Verifica que el contenedor padre tenga width/height definidos.

### El PDF no se genera

**Causa**: Sin conexión a internet (jsPDF se carga desde CDN).

**Solución**: El sistema hace fallback a descarga de texto plano.

---

## 📞 Contacto y Contribuciones

- **Autor**: Joel Pasapera
- **Versión**: 1.0.0
- **Licencia**: MIT

### Para Contribuir

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcion`
3. Commit: `git commit -m 'Agregar nueva función'`
4. Push: `git push origin feature/nueva-funcion`
5. Pull Request

---

> 💡 **Tip**: Mantén la consola del navegador abierta durante el desarrollo. El sistema loguea información útil en modo debug.
