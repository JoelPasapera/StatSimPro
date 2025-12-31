/**
 * @fileoverview Composition Root - Punto de entrada principal de StatSim Pro
 * Este archivo actúa como el "director" que importa y conecta todos los módulos.
 * NO contiene lógica de negocio, solo orquestación e integración.
 * 
 * @module app
 * @author Joel Pasapera - Arquitectura empresarial
 */

// ============================================
// IMPORTS - Core
// ============================================
import { store } from './core/state.js';
import { CONFIG, SELECTORES, MENSAJES, TEXTOS } from './core/config.js';

// ============================================
// IMPORTS - Lógica de Negocio (Cálculos Puros)
// ============================================
import { 
    calcularDescriptivas,
    calcularPercentil,
    calcularAsimetria,
    calcularCurtosis 
} from './logic/statistics.js';

import { 
    pruebaDeNormalidad,
    shapiroWilk,
    kolmogorovSmirnov 
} from './logic/normality.js';

import { 
    calcularCorrelacion,
    correlacionPearson,
    correlacionSpearman,
    interpretarCorrelacion 
} from './logic/correlation.js';

import { 
    generarBaseDatos,
    generarValorNormal,
    generarPuntajesPrueba 
} from './logic/generator.js';

import { 
    generarInterpretacionNormalidad,
    generarInterpretacionCorrelacion,
    generarInterpretacionHipotesis,
    generarMarcoMetodologico,
    generarDiscusion 
} from './logic/interpretations.js';

// ============================================
// IMPORTS - UI (Manipulación del DOM)
// ============================================
import { 
    obtenerElemento,
    obtenerElementos,
    establecerTexto,
    establecerHTML,
    mostrarElemento,
    ocultarElemento,
    delegarEvento,
    scrollSuave
} from './ui/dom-manager.js';

import { 
    mostrarToast,
    toastExito,
    toastError,
    toastAdvertencia 
} from './ui/toast.js';

import { 
    inicializarNavegacion,
    navegarA 
} from './ui/navigation.js';

import { 
    crearEncabezados,
    poblarTabla,
    crearTablaResultados,
    inferirColumnas 
} from './ui/tables.js';

import { 
    recolectarFormulario,
    recolectarTablaConfiguracion,
    poblarSelect,
    agregarFilaDinamica,
    eliminarFilaDinamica,
    obtenerRadioSeleccionado 
} from './ui/forms.js';

// ============================================
// IMPORTS - Servicios
// ============================================
import { 
    parsearCSV,
    generarCSV,
    obtenerEstadisticasCSV 
} from './services/csv-parser.js';

import { 
    cargarArchivoCSV,
    descargarCSV,
    descargarTexto,
    validarExtensionArchivo 
} from './services/file-handler.js';

import {
    descargarReportePDF,
    verificarDisponibilidadPDF
} from './services/pdf-report.js';

// ============================================
// IMPORTS - UI Adicionales
// ============================================
import {
    crearGraficoDispersion,
    limpiarGraficos
} from './ui/charts.js';

// ============================================
// IMPORTS - Utilidades
// ============================================
import { 
    validarConfiguracionPrueba,
    validarTamanoMuestral,
    validarSeleccionVariables 
} from './utils/validators.js';

import { formatearNumero, debounce } from './utils/helpers.js';

// ============================================
// ESTADO INICIAL
// ============================================
store.setState({
    seccionActiva: 'simulador',
    datosGenerados: null,
    datosCargados: null,
    configuracionGenerador: {
        tamanoMuestra: 100,
        pruebas: [],
        sociodemograficos: []
    },
    resultadosAnalisis: null
});

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

/**
 * Punto de entrada principal - inicializa toda la aplicación
 */
async function iniciarAplicacion() {
    try {
        console.log(`${CONFIG.APP.NOMBRE} v${CONFIG.APP.VERSION} iniciando...`);
        
        // 1. Inicializar navegación SPA
        inicializarNavegacion({ seccionInicial: 'simulador' });
        
        // 2. Configurar event listeners del generador
        configurarGenerador();
        
        // 3. Configurar event listeners del analizador
        configurarAnalizador();
        
        // 4. Suscribirse a cambios de estado relevantes
        configurarSuscripcionesEstado();
        
        console.log('Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        toastError('Error al cargar la aplicación. Recarga la página.');
    }
}

// ============================================
// CONFIGURACIÓN DEL GENERADOR
// ============================================

/**
 * Configura todos los event listeners del módulo generador
 */
function configurarGenerador() {
    // Botón agregar prueba
    delegarEvento(document.body, 'click', '#btnAgregarPrueba', () => {
        agregarFilaDinamica('bodyPruebas', 'fila-prueba');
        toastExito('Fila agregada');
    });
    
    // Botón agregar sociodemográfico
    delegarEvento(document.body, 'click', '#btnAgregarSocio', () => {
        agregarFilaDinamica('bodySocio', 'fila-socio');
        toastExito('Variable agregada');
    });
    
    // Delegación para eliminar filas de pruebas
    delegarEvento(document.body, 'click', '#bodyPruebas .btn-delete', (e, btn) => {
        const fila = btn.closest('tr');
        if (eliminarFilaDinamica(fila, 'bodyPruebas', 1)) {
            toastExito('Fila eliminada');
        }
    });
    
    // Delegación para eliminar filas sociodemográficas
    delegarEvento(document.body, 'click', '#bodySocio .btn-delete', (e, btn) => {
        const fila = btn.closest('tr');
        if (eliminarFilaDinamica(fila, 'bodySocio', 1)) {
            toastExito('Variable eliminada');
        }
    });
    
    // Botón generar base de datos
    delegarEvento(document.body, 'click', '#btnGenerar', manejarGenerarBaseDatos);
    
    // Botón descargar CSV
    delegarEvento(document.body, 'click', '#btnDescargarCSV', manejarDescargarCSV);
    
    // Botones importar/exportar configuración
    configurarImportExportPruebas();
    configurarImportExportSocio();
}

/**
 * Maneja la generación de la base de datos
 */
async function manejarGenerarBaseDatos() {
    try {
        // 1. Recolectar configuración
        const tamanoMuestra = parseInt(obtenerElemento('#tamanoMuestra')?.value);
        
        // Validar tamaño muestral
        const validacionTamano = validarTamanoMuestral(tamanoMuestra);
        if (!validacionTamano.valido) {
            toastError(validacionTamano.errores[0]);
            return;
        }
        
        // 2. Recolectar pruebas
        const pruebas = recolectarTablaConfiguracion('bodyPruebas', [
            'nombre', 'numItems', 'media', 'desviacion', 'minimo', 'maximo'
        ]);
        
        if (pruebas.length === 0) {
            toastError(MENSAJES.ERRORES.DATOS_REQUERIDOS);
            return;
        }
        
        // Validar pruebas
        for (const prueba of pruebas) {
            const validacion = validarConfiguracionPrueba(prueba);
            if (!validacion.valido) {
                toastError(validacion.errores[0]);
                return;
            }
        }
        
        // 3. Recolectar sociodemográficos
        const sociodemograficos = recolectarTablaConfiguracion('bodySocio', [
            'categoria', 'promedio', 'desviacion', 'minimo', 'maximo', 'decimales'
        ]);
        
        if (sociodemograficos.length === 0) {
            toastError('Debe agregar al menos una variable sociodemográfica');
            return;
        }
        
        // 4. Mostrar feedback de procesamiento
        toastExito('Generando base de datos...');
        
        // 5. Generar datos (usar setTimeout para permitir actualización UI)
        setTimeout(() => {
            const configuracion = {
                tamanoMuestra,
                pruebas: pruebas.map(p => ({
                    ...p,
                    nombreCorto: generarNombreCorto(p.nombre),
                    numItems: parseInt(p.numItems),
                    media: parseFloat(p.media),
                    desviacion: parseFloat(p.desviacion),
                    minimo: p.minimo ? parseFloat(p.minimo) : null,
                    maximo: p.maximo ? parseFloat(p.maximo) : null
                })),
                sociodemograficos: sociodemograficos.map(s => ({
                    ...s,
                    categoriaCorta: generarNombreCorto(s.categoria),
                    promedio: parseFloat(s.promedio),
                    desviacion: parseFloat(s.desviacion),
                    minimo: s.minimo ? parseFloat(s.minimo) : null,
                    maximo: s.maximo ? parseFloat(s.maximo) : null,
                    decimales: parseInt(s.decimales) || 2
                }))
            };
            
            const datosGenerados = generarBaseDatos(configuracion);
            
            // 6. Guardar en estado
            store.setState({ 
                datosGenerados,
                configuracionGenerador: configuracion
            });
            
            // 7. Mostrar preview
            mostrarPreviewDatos(datosGenerados, configuracion);
            
            // 8. Habilitar botones
            const btnDescargar = obtenerElemento('#btnDescargarCSV');
            const btnUsar = obtenerElemento('#btnUsarGenerados');
            if (btnDescargar) btnDescargar.disabled = false;
            if (btnUsar) btnUsar.disabled = false;
            
            toastExito('¡Base de datos generada exitosamente!');
            
        }, 100);
        
    } catch (error) {
        console.error('Error al generar datos:', error);
        toastError(error.message || 'Error al generar la base de datos');
    }
}

/**
 * Muestra el preview de los datos generados
 */
function mostrarPreviewDatos(datos, configuracion) {
    const container = obtenerElemento('#previewContainer');
    if (!container) return;
    
    // Actualizar estadísticas
    establecerTexto(obtenerElemento('#statParticipantes'), String(datos.length));
    establecerTexto(obtenerElemento('#statVariables'), String(Object.keys(datos[0]).length));
    establecerTexto(obtenerElemento('#statPruebas'), String(configuracion.pruebas.length));
    
    // Crear tabla preview
    const columnas = inferirColumnas(datos);
    const thead = obtenerElemento('#previewHead');
    const tbody = obtenerElemento('#previewBody');
    
    if (thead && tbody) {
        crearEncabezados(thead, columnas);
        poblarTabla(tbody, datos, columnas, { maxFilas: 10 });
    }
    
    mostrarElemento(container);
    scrollSuave(container);
}

/**
 * Maneja la descarga del CSV generado
 */
function manejarDescargarCSV() {
    const datos = store.getState().datosGenerados;
    
    if (!datos || datos.length === 0) {
        toastAdvertencia('No hay datos para descargar');
        return;
    }
    
    descargarCSV(datos, 'base_datos_simulada');
    toastExito('CSV descargado exitosamente');
}

// ============================================
// CONFIGURACIÓN DEL ANALIZADOR
// ============================================

/**
 * Configura todos los event listeners del módulo analizador
 */
function configurarAnalizador() {
    // Botón usar datos generados
    delegarEvento(document.body, 'click', '#btnUsarGenerados', manejarUsarDatosGenerados);
    
    // Input file CSV
    const fileInput = obtenerElemento('#fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', manejarCargarArchivoCSV);
    }
    
    // Botón analizar
    delegarEvento(document.body, 'click', '#btnAnalizar', manejarEjecutarAnalisis);
    
    // Botón descargar resultados
    delegarEvento(document.body, 'click', '#btnDescargarResultados', manejarDescargarResultados);
}

/**
 * Usa los datos generados para el análisis
 */
function manejarUsarDatosGenerados() {
    const datosGenerados = store.getState().datosGenerados;
    
    if (!datosGenerados || datosGenerados.length === 0) {
        toastAdvertencia('No hay datos generados. Genera una base de datos primero.');
        return;
    }
    
    store.setState({ datosCargados: datosGenerados });
    mostrarDatosCargados(datosGenerados);
    toastExito('Datos cargados exitosamente');
}

/**
 * Carga un archivo CSV subido por el usuario
 */
async function manejarCargarArchivoCSV(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    
    // Validar extensión
    const validacion = validarExtensionArchivo(archivo, ['.csv']);
    if (!validacion.valido) {
        toastError(validacion.mensaje);
        return;
    }
    
    try {
        const resultado = await cargarArchivoCSV(archivo);
        
        if (!resultado.exito) {
            toastError(resultado.errores[0] || 'Error al cargar el archivo');
            return;
        }
        
        if (resultado.advertencias.length > 0) {
            resultado.advertencias.forEach(adv => console.warn(adv));
        }
        
        store.setState({ datosCargados: resultado.datos });
        mostrarDatosCargados(resultado.datos);
        toastExito('Archivo CSV cargado exitosamente');
        
    } catch (error) {
        console.error('Error al cargar CSV:', error);
        toastError('Error al procesar el archivo CSV');
    }
    
    // Limpiar input
    evento.target.value = '';
}

/**
 * Muestra los datos cargados en la interfaz
 */
function mostrarDatosCargados(datos) {
    const container = obtenerElemento('#datosContainer');
    const seleccionContainer = obtenerElemento('#seleccionContainer');
    
    if (!container) return;
    
    // Actualizar estadísticas
    establecerTexto(obtenerElemento('#analisisN'), String(datos.length));
    establecerTexto(obtenerElemento('#analisisVars'), String(Object.keys(datos[0]).length));
    
    // Crear tabla preview
    const columnas = inferirColumnas(datos);
    const thead = obtenerElemento('#analisisHead');
    const tbody = obtenerElemento('#analisisBody');
    
    if (thead && tbody) {
        crearEncabezados(thead, columnas);
        poblarTabla(tbody, datos, columnas, { maxFilas: 10 });
    }
    
    // Poblar selectores de variables (solo numéricas)
    const estadisticas = obtenerEstadisticasCSV(datos);
    const opciones = estadisticas.columnasNumericas.map(col => ({
        value: col,
        label: col
    }));
    
    poblarSelect('variable1', opciones, { placeholder: 'Seleccionar variable...' });
    poblarSelect('variable2', opciones, { placeholder: 'Seleccionar variable...' });
    
    mostrarElemento(container);
    if (seleccionContainer) mostrarElemento(seleccionContainer);
    
    scrollSuave(container);
}

/**
 * Ejecuta el análisis estadístico completo
 */
async function manejarEjecutarAnalisis() {
    try {
        const datos = store.getState().datosCargados;
        
        if (!datos || datos.length === 0) {
            toastAdvertencia('Primero debes cargar datos');
            return;
        }
        
        // Obtener variables seleccionadas
        const var1 = obtenerElemento('#variable1')?.value;
        const var2 = obtenerElemento('#variable2')?.value;
        const tipoPrueba = obtenerRadioSeleccionado('tipoPrueba') || 'bilateral';
        
        // Validar selección
        const validacion = validarSeleccionVariables(var1, var2);
        if (!validacion.valido) {
            toastAdvertencia(validacion.errores[0]);
            return;
        }
        
        toastExito('Ejecutando análisis...');
        
        // Ejecutar análisis en el siguiente ciclo para actualizar UI
        setTimeout(() => {
            // Obtener contexto de investigación
            const unidadAnalisis = obtenerElemento('#unidadAnalisis')?.value || '';
            const lugarContexto = obtenerElemento('#lugarContexto')?.value || '';
            
            // Extraer valores numéricos
            const valores1 = extraerValoresNumericos(datos, var1);
            const valores2 = extraerValoresNumericos(datos, var2);
            
            // Calcular correlación (incluye normalidad)
            const resultadoCorrelacion = calcularCorrelacion(valores1, valores2, tipoPrueba);
            
            // Generar marco metodológico
            const marco = generarMarcoMetodologico(var1, var2, unidadAnalisis, lugarContexto);
            
            // Guardar resultados en estado
            store.setState({
                resultadosAnalisis: {
                    var1,
                    var2,
                    tipoPrueba,
                    correlacion: resultadoCorrelacion,
                    marco,
                    unidadAnalisis,
                    lugarContexto,
                    datosX: valores1,
                    datosY: valores2
                }
            });
            
            // Renderizar todas las secciones de resultados
            renderizarMarcoMetodologico(marco);
            renderizarPruebasNormalidad(var1, var2, resultadoCorrelacion);
            renderizarCorrelacion(var1, var2, resultadoCorrelacion);
            renderizarGraficoDispersion(var1, var2, valores1, valores2, resultadoCorrelacion);
            renderizarDecision(var1, var2, resultadoCorrelacion);
            renderizarDiscusion(var1, var2, resultadoCorrelacion, unidadAnalisis, lugarContexto);
            renderizarReferencias();
            
            toastExito('Análisis completado exitosamente');
            
        }, 100);
        
    } catch (error) {
        console.error('Error en análisis:', error);
        toastError(error.message || 'Error al ejecutar el análisis');
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO DE RESULTADOS
// ============================================

function renderizarMarcoMetodologico(marco) {
    const container = obtenerElemento('#marcoMetodologicoContainer');
    if (!container) return;
    
    const html = `
        <div class="result-section">
            <h3 class="section-title">📋 Marco Metodológico</h3>
            
            <div class="result-box">
                <h4 class="result-subtitle">❓ Pregunta de Investigación</h4>
                <p class="marco-text">${marco.preguntaInvestigacion}</p>
            </div>
            
            <div class="result-box">
                <h4 class="result-subtitle">🎯 Objetivo General</h4>
                <p class="marco-text">${marco.objetivoGeneral}</p>
            </div>
            
            <div class="result-box">
                <h4 class="result-subtitle">📋 Objetivos Específicos</h4>
                <ol class="marco-list">
                    ${marco.objetivosEspecificos.map(obj => `<li>${obj}</li>`).join('')}
                </ol>
            </div>
            
            <div class="result-box">
                <h4 class="result-subtitle">💡 Hipótesis de Investigación (H₁)</h4>
                <p class="marco-text">${marco.hipotesis.hipotesisInvestigador}</p>
            </div>
            
            <div class="result-box">
                <h4 class="result-subtitle">❌ Hipótesis Nula (H₀)</h4>
                <p class="marco-text">${marco.hipotesis.hipotesisNula}</p>
            </div>
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

function renderizarPruebasNormalidad(var1, var2, resultado) {
    const container = obtenerElemento('#pruebasNormalidadContainer');
    if (!container) return;
    
    const interpretacion = generarInterpretacionNormalidad(var1, var2, resultado);
    
    const html = `
        <div class="result-section">
            <h3 class="section-title">Pruebas de Normalidad</h3>
            <p class="result-subtitle">${TEXTOS.METODOLOGIA_NORMALIDAD}</p>
            
            <div class="result-box" style="margin-bottom: 1rem;">
                <h5 style="margin-bottom: 0.5rem; font-weight: 600;">Variable: ${var1}</h5>
                <table class="result-table">
                    <tr><td>Prueba utilizada:</td><td><strong>${resultado.normalidad1.prueba}</strong> (${resultado.normalidad1.razon})</td></tr>
                    <tr><td>Estadístico:</td><td>${formatearNumero(resultado.normalidad1.estadistico, 4)}</td></tr>
                    <tr><td>p-valor:</td><td>${formatearNumero(resultado.normalidad1.pValor, 4)}</td></tr>
                    <tr><td>Decisión:</td><td><strong>${resultado.normalidad1.decision}</strong></td></tr>
                </table>
            </div>
            
            <div class="result-box">
                <h5 style="margin-bottom: 0.5rem; font-weight: 600;">Variable: ${var2}</h5>
                <table class="result-table">
                    <tr><td>Prueba utilizada:</td><td><strong>${resultado.normalidad2.prueba}</strong> (${resultado.normalidad2.razon})</td></tr>
                    <tr><td>Estadístico:</td><td>${formatearNumero(resultado.normalidad2.estadistico, 4)}</td></tr>
                    <tr><td>p-valor:</td><td>${formatearNumero(resultado.normalidad2.pValor, 4)}</td></tr>
                    <tr><td>Decisión:</td><td><strong>${resultado.normalidad2.decision}</strong></td></tr>
                </table>
            </div>
            
            <div class="result-box interpretation-box" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 1.5rem; margin-top: 1rem;">
                <h5 style="margin-bottom: 0.75rem; color: #1e40af; font-weight: 600;">📊 Interpretación Estadística</h5>
                <p style="margin: 0; line-height: 1.8; text-align: justify; color: #1e293b;">${interpretacion}</p>
            </div>
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

function renderizarCorrelacion(var1, var2, resultado) {
    const container = obtenerElemento('#resultadosCorrelacion');
    if (!container) return;
    
    const interpretacion = generarInterpretacionCorrelacion(var1, var2, resultado);
    const simbolo = resultado.tipoCorrelacion === 'Pearson' ? 'r' : 'ρ';
    
    const html = `
        <div class="result-section">
            <h3 class="section-title">Análisis de Correlación</h3>
            <p class="result-subtitle">${TEXTOS.METODOLOGIA_CORRELACION}</p>
            
            <div class="result-box">
                <table class="result-table">
                    <tr><td>Variables:</td><td><strong>${var1} - ${var2}</strong></td></tr>
                    <tr><td>N:</td><td>${resultado.n}</td></tr>
                    <tr><td>Coeficiente utilizado:</td><td><strong>${resultado.tipoCorrelacion}</strong></td></tr>
                    <tr><td>Razón:</td><td>${resultado.normalidad1.normal && resultado.normalidad2.normal ? 'Ambas variables siguen distribución normal' : 'Al menos una variable no sigue distribución normal'}</td></tr>
                    <tr><td>Coeficiente (${simbolo}):</td><td><strong style="font-size: 1.1em;">${formatearNumero(resultado.coeficiente, 4)}</strong></td></tr>
                    <tr><td>p-valor (${resultado.tipoPrueba}):</td><td><strong>${formatearNumero(resultado.pValor, 4)}</strong></td></tr>
                    <tr><td>Interpretación:</td><td><strong>${resultado.interpretacion.texto}</strong></td></tr>
                </table>
            </div>
            
            <div class="result-box interpretation-box" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 1.5rem; margin-top: 1rem;">
                <h5 style="margin-bottom: 0.75rem; color: #15803d; font-weight: 600;">📈 Interpretación Estadística</h5>
                <p style="margin: 0; line-height: 1.8; text-align: justify; color: #1e293b;">${interpretacion}</p>
            </div>
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

function renderizarDecision(var1, var2, resultado) {
    const container = obtenerElemento('#resultadosDecision');
    if (!container) return;
    
    const prueba = {
        alpha: CONFIG.ESTADISTICA.ALPHA,
        decision: resultado.pValor < CONFIG.ESTADISTICA.ALPHA ? 'rechazar' : 'no_rechazar',
        pValor: resultado.pValor
    };
    
    const interpretacion = generarInterpretacionHipotesis(var1, var2, resultado, prueba);
    const claseDecision = prueba.decision === 'rechazar' ? 'decision-reject' : 'decision-accept';
    
    const html = `
        <div class="result-section">
            <h3 class="section-title">Prueba de Hipótesis</h3>
            <p class="result-subtitle">${TEXTOS.METODOLOGIA_HIPOTESIS}</p>
            
            <div class="result-box">
                <table class="result-table">
                    <tr><td>Nivel de significancia (α):</td><td><strong>${prueba.alpha}</strong></td></tr>
                    <tr><td>p-valor:</td><td><strong>${formatearNumero(resultado.pValor, 4)}</strong></td></tr>
                    <tr><td>Comparación:</td><td>${formatearNumero(resultado.pValor, 4)} ${prueba.decision === 'rechazar' ? '<' : '≥'} ${prueba.alpha}</td></tr>
                    <tr><td>Decisión sobre H₀:</td><td class="${claseDecision}"><strong>${prueba.decision === 'rechazar' ? 'SE RECHAZA H₀' : 'NO SE RECHAZA H₀'}</strong></td></tr>
                </table>
            </div>
            
            <div class="result-box interpretation-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 1.5rem; margin-top: 1rem;">
                <h5 style="margin-bottom: 0.75rem; color: #b45309; font-weight: 600;">⚖️ Interpretación Estadística</h5>
                <p style="margin: 0; line-height: 1.8; text-align: justify; color: #1e293b;">${interpretacion}</p>
            </div>
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

/**
 * Renderiza el gráfico de dispersión con línea de tendencia
 */
function renderizarGraficoDispersion(var1, var2, datosX, datosY, resultado) {
    const container = obtenerElemento('#resultadosGrafico');
    if (!container) return;
    
    // Limpiar gráfico anterior si existe
    limpiarGraficos('resultadosGrafico');
    
    // Mostrar el contenedor
    mostrarElemento(container);
    
    // Crear el gráfico
    try {
        crearGraficoDispersion('graficoDispersion', datosX, datosY, {
            titulo: `Correlación: ${var1} vs ${var2}`,
            etiquetaX: var1,
            etiquetaY: var2,
            colorPuntos: '#3b82f6',
            colorLinea: '#ef4444',
            mostrarLinea: true
        });
        
        // Agregar leyenda debajo del gráfico
        const leyenda = document.createElement('div');
        leyenda.className = 'chart-legend';
        leyenda.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; font-size: 0.875rem; color: #64748b;">
                <span>
                    <span style="display: inline-block; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; margin-right: 0.5rem;"></span>
                    Datos observados (n=${datosX.length})
                </span>
                <span>
                    <span style="display: inline-block; width: 20px; height: 2px; background: #ef4444; margin-right: 0.5rem; vertical-align: middle;"></span>
                    Línea de tendencia
                </span>
                <span>
                    <strong>r = ${formatearNumero(resultado.coeficiente, 3)}</strong>
                </span>
            </div>
        `;
        container.appendChild(leyenda);
        
    } catch (error) {
        console.error('Error al crear gráfico:', error);
        container.innerHTML = `
            <div class="result-section" style="text-align: center; padding: 2rem;">
                <p style="color: #64748b;">No se pudo generar el gráfico de dispersión</p>
            </div>
        `;
    }
}

function renderizarDiscusion(var1, var2, resultado, unidadAnalisis, lugarContexto) {
    const container = obtenerElemento('#resultadosDiscusion');
    if (!container) return;
    
    const discusion = generarDiscusion(var1, var2, resultado, unidadAnalisis, lugarContexto);
    
    const html = `
        <div class="result-section">
            <h3 class="section-title">Discusión (Plantilla)</h3>
            <div class="discussion-box">
                ${discusion.replace(/\[(.*?)\]/g, '<span class="highlight">[$1]</span>')}
            </div>
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

function renderizarReferencias() {
    const container = obtenerElemento('#resultadosContainer');
    if (!container) return;
    
    const html = `
        <div class="references-container">
            <h4 class="result-title">Referencias Bibliográficas</h4>
            ${TEXTOS.REFERENCIAS.map((ref, i) => `
                <div class="reference-card">
                    <p class="reference-text">${i + 1}. ${ref.autor} (${ref.anio}). ${ref.titulo}. 
                        <a href="${ref.url}" target="_blank">${ref.url}</a>
                    </p>
                </div>
            `).join('')}
        </div>
    `;
    
    establecerHTML(container, html);
    mostrarElemento(container);
}

/**
 * Descarga los resultados del análisis como PDF
 */
async function manejarDescargarResultados() {
    const resultados = store.getState().resultadosAnalisis;
    
    if (!resultados) {
        toastAdvertencia('No hay resultados para descargar');
        return;
    }
    
    // Intentar generar PDF
    const disponible = await verificarDisponibilidadPDF();
    
    if (disponible) {
        toastExito('Generando reporte PDF...');
        
        const resultado = await descargarReportePDF({
            var1: resultados.var1,
            var2: resultados.var2,
            correlacion: resultados.correlacion,
            marco: resultados.marco,
            unidadAnalisis: resultados.unidadAnalisis,
            lugarContexto: resultados.lugarContexto
        });
        
        if (resultado.exito) {
            toastExito('Reporte PDF descargado');
        } else {
            toastError('Error al generar PDF: ' + resultado.error);
            // Fallback a texto
            const contenido = generarTextoResultados(resultados);
            descargarTexto(contenido, 'resultados_analisis');
        }
    } else {
        // Fallback a texto si no hay conexión para cargar jsPDF
        const contenido = generarTextoResultados(resultados);
        descargarTexto(contenido, 'resultados_analisis');
        toastExito('Resultados descargados como texto');
    }
}

function generarTextoResultados(resultados) {
    const { var1, var2, correlacion, marco } = resultados;
    
    return `
RESULTADOS DEL ANÁLISIS ESTADÍSTICO
====================================
Generado por StatSim Pro
Fecha: ${new Date().toLocaleDateString('es-PE')}

1. MARCO METODOLÓGICO
---------------------
Pregunta: ${marco.preguntaInvestigacion}
Objetivo: ${marco.objetivoGeneral}
H₁: ${marco.hipotesis.hipotesisInvestigador}
H₀: ${marco.hipotesis.hipotesisNula}

2. PRUEBAS DE NORMALIDAD
------------------------
${var1}: ${correlacion.normalidad1.prueba} = ${correlacion.normalidad1.estadistico.toFixed(4)}, p = ${correlacion.normalidad1.pValor.toFixed(4)}
${var2}: ${correlacion.normalidad2.prueba} = ${correlacion.normalidad2.estadistico.toFixed(4)}, p = ${correlacion.normalidad2.pValor.toFixed(4)}

3. CORRELACIÓN
--------------
Coeficiente (${correlacion.tipoCorrelacion}): ${correlacion.coeficiente.toFixed(4)}
p-valor: ${correlacion.pValor.toFixed(4)}
Interpretación: ${correlacion.interpretacion.texto}

4. DECISIÓN
-----------
${correlacion.pValor < 0.05 ? 'Se RECHAZA H₀' : 'NO se rechaza H₀'}
`;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera nombre corto para columnas
 */
function generarNombreCorto(nombre) {
    return nombre
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(p => p.charAt(0).toUpperCase())
        .join('')
        .substring(0, 10);
}

/**
 * Extrae valores numéricos de una columna
 */
function extraerValoresNumericos(datos, columna) {
    return datos
        .map(fila => fila[columna])
        .filter(valor => {
            const num = parseFloat(valor);
            return !isNaN(num) && isFinite(num);
        })
        .map(valor => parseFloat(valor));
}

/**
 * Configura suscripciones a cambios de estado
 */
function configurarSuscripcionesEstado() {
    // Ejemplo: reaccionar a cambios de datos
    store.subscribe('datosCargados', (datos) => {
        console.log('Datos cargados actualizados:', datos?.length || 0, 'filas');
    });
}

// ============================================
// IMPORT/EXPORT CONFIGURACIONES
// ============================================

function configurarImportExportPruebas() {
    delegarEvento(document.body, 'click', '#btnExportarPruebas', () => {
        const pruebas = recolectarTablaConfiguracion('bodyPruebas', [
            'nombre', 'numItems', 'media', 'desviacion', 'minimo', 'maximo'
        ]);
        
        if (pruebas.length === 0) {
            toastAdvertencia('No hay pruebas para exportar');
            return;
        }
        
        descargarCSV(pruebas, 'configuracion_pruebas', {
            columnas: ['nombre', 'numItems', 'media', 'desviacion', 'minimo', 'maximo']
        });
        toastExito('Configuración exportada');
    });
    
    delegarEvento(document.body, 'click', '#btnImportarPruebas', () => {
        obtenerElemento('#importPruebasInput')?.click();
    });
    
    const inputPruebas = obtenerElemento('#importPruebasInput');
    if (inputPruebas) {
        inputPruebas.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            
            const resultado = await cargarArchivoCSV(archivo);
            if (resultado.exito) {
                // TODO: Poblar tabla con datos importados
                toastExito(`Importadas ${resultado.datos.length} pruebas`);
            } else {
                toastError(resultado.errores[0]);
            }
            
            e.target.value = '';
        });
    }
}

function configurarImportExportSocio() {
    delegarEvento(document.body, 'click', '#btnExportarSocio', () => {
        const socio = recolectarTablaConfiguracion('bodySocio', [
            'categoria', 'promedio', 'desviacion', 'minimo', 'maximo', 'decimales'
        ]);
        
        if (socio.length === 0) {
            toastAdvertencia('No hay variables para exportar');
            return;
        }
        
        descargarCSV(socio, 'configuracion_sociodemograficos');
        toastExito('Configuración exportada');
    });
    
    delegarEvento(document.body, 'click', '#btnImportarSocio', () => {
        obtenerElemento('#importSocioInput')?.click();
    });
}

// ============================================
// PUNTO DE ENTRADA
// ============================================
document.addEventListener('DOMContentLoaded', iniciarAplicacion);

// Exportar para testing si es necesario
export { iniciarAplicacion };
