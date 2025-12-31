/**
 * @fileoverview Módulo generador de datos estadísticos simulados
 * Genera bases de datos con distribución normal controlada para investigación.
 * Permite configurar pruebas psicométricas y variables sociodemográficas.
 * 
 * @module logic/generator
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { generarValorNormal, calcularDescriptivas } from './statistics.js';
import { generarNombreCorto } from '../utils/helpers.js';
import { estado, actualizarEstado } from '../core/state.js';
import { CONFIG } from '../core/config.js';

/**
 * @typedef {Object} ConfiguracionPrueba
 * @property {string} nombre - Nombre completo de la prueba
 * @property {string} nombreCorto - Abreviación para columnas
 * @property {number} numItems - Número de ítems de la prueba
 * @property {number} media - Media esperada por ítem
 * @property {number} desviacion - Desviación estándar por ítem
 * @property {number|null} minimo - Valor mínimo por ítem
 * @property {number|null} maximo - Valor máximo por ítem
 */

/**
 * @typedef {Object} ConfiguracionSociodemografico
 * @property {string} categoria - Nombre de la variable
 * @property {string} categoriaCorta - Abreviación para columnas
 * @property {number} promedio - Valor promedio esperado
 * @property {number} desviacion - Desviación estándar
 * @property {number|null} minimo - Valor mínimo
 * @property {number|null} maximo - Valor máximo
 * @property {number} decimales - Número de decimales a mostrar
 */

/**
 * @typedef {Object} ConfiguracionGenerador
 * @property {number} tamanoMuestra - Número de participantes a generar
 * @property {ConfiguracionPrueba[]} pruebas - Lista de pruebas
 * @property {ConfiguracionSociodemografico[]} sociodemograficos - Variables sociodemográficas
 */

/**
 * Genera una base de datos completa según la configuración
 * @param {ConfiguracionGenerador} config - Configuración del generador
 * @returns {Object[]} Array de objetos, cada uno representa un participante
 */
export function generarBaseDatos(config) {
    const n = config.tamanoMuestra;
    const datos = [];
    
    for (let i = 0; i < n; i++) {
        const participante = { ID: i + 1 };
        
        // Generar datos sociodemográficos
        config.sociodemograficos.forEach(socio => {
            let valor = generarValorNormal(socio.promedio, socio.desviacion);
            
            // Aplicar límites si están definidos
            if (socio.minimo !== null && socio.maximo !== null) {
                valor = Math.max(socio.minimo, Math.min(socio.maximo, valor));
            }
            
            // Redondear según decimales especificados
            const factor = Math.pow(10, socio.decimales);
            participante[socio.categoriaCorta] = Math.round(valor * factor) / factor;
        });
        
        // Generar datos de cada prueba
        config.pruebas.forEach(prueba => {
            const puntajes = generarPuntajesPrueba(
                prueba.numItems,
                prueba.media,
                prueba.desviacion,
                prueba.minimo,
                prueba.maximo
            );
            
            // Agregar cada ítem como columna
            puntajes.items.forEach((puntaje, idx) => {
                const nombreColumna = `${prueba.nombreCorto}${idx + 1}`;
                participante[nombreColumna] = puntaje;
            });
            
            // Agregar total de la prueba
            participante[`Total_${prueba.nombreCorto}`] = puntajes.total;
        });
        
        datos.push(participante);
    }
    
    return datos;
}

/**
 * Genera puntajes para una prueba psicométrica completa
 * @param {number} numItems - Número de ítems
 * @param {number} mediaPorItem - Media esperada por ítem
 * @param {number} desviacionPorItem - Desviación estándar por ítem
 * @param {number|null} minItem - Valor mínimo por ítem
 * @param {number|null} maxItem - Valor máximo por ítem
 * @returns {Object} Objeto con array de ítems y total
 */
export function generarPuntajesPrueba(numItems, mediaPorItem, desviacionPorItem, minItem = null, maxItem = null) {
    // Valores por defecto para escala Likert típica
    if (minItem === null) minItem = 1;
    if (maxItem === null) maxItem = 7;
    
    const items = [];
    
    for (let i = 0; i < numItems; i++) {
        let valor = generarValorNormal(mediaPorItem, desviacionPorItem);
        
        // Aplicar límites del rango
        valor = Math.max(minItem, Math.min(maxItem, valor));
        
        // Redondear al entero más cercano
        valor = Math.round(valor);
        
        items.push(valor);
    }
    
    // Total es la suma de todos los ítems
    const total = items.reduce((a, b) => a + b, 0);
    
    return { items, total };
}

/**
 * Procesa la configuración de pruebas desde el formulario
 * @param {Object[]} pruebasRaw - Datos crudos del formulario
 * @returns {ConfiguracionPrueba[]} Configuración procesada
 */
export function procesarConfiguracionPruebas(pruebasRaw) {
    return pruebasRaw
        .filter(p => p.nombre && !isNaN(p.numItems) && !isNaN(p.media) && !isNaN(p.desviacion))
        .map(p => ({
            nombre: p.nombre.trim(),
            nombreCorto: generarNombreCorto(p.nombre),
            numItems: parseInt(p.numItems),
            media: parseFloat(p.media),
            desviacion: parseFloat(p.desviacion),
            minimo: p.minimo !== '' && !isNaN(p.minimo) ? parseFloat(p.minimo) : null,
            maximo: p.maximo !== '' && !isNaN(p.maximo) ? parseFloat(p.maximo) : null
        }));
}

/**
 * Procesa la configuración de variables sociodemográficas
 * @param {Object[]} socioRaw - Datos crudos del formulario
 * @returns {ConfiguracionSociodemografico[]} Configuración procesada
 */
export function procesarConfiguracionSociodemograficos(socioRaw) {
    return socioRaw
        .filter(s => s.categoria && !isNaN(s.promedio) && !isNaN(s.desviacion))
        .map(s => ({
            categoria: s.categoria.trim(),
            categoriaCorta: generarNombreCorto(s.categoria),
            promedio: parseFloat(s.promedio),
            desviacion: parseFloat(s.desviacion),
            minimo: s.minimo !== '' && !isNaN(s.minimo) ? parseFloat(s.minimo) : null,
            maximo: s.maximo !== '' && !isNaN(s.maximo) ? parseFloat(s.maximo) : null,
            decimales: s.decimales !== '' && !isNaN(s.decimales) 
                ? Math.min(Math.max(parseInt(s.decimales), 0), 4) 
                : CONFIG.GENERADOR.DECIMALES_DEFAULT
        }));
}

/**
 * Exporta datos a formato CSV
 * @param {Object[]} datos - Array de objetos con los datos
 * @returns {string} Contenido del CSV
 */
export function exportarCSV(datos) {
    if (!datos || datos.length === 0) {
        throw new Error('No hay datos para exportar');
    }
    
    const encabezados = Object.keys(datos[0]);
    let csv = encabezados.join(',') + '\n';
    
    datos.forEach(fila => {
        const valores = encabezados.map(enc => {
            let valor = fila[enc];
            // Escapar valores que contengan comas
            if (typeof valor === 'string' && valor.includes(',')) {
                valor = `"${valor}"`;
            }
            return valor;
        });
        csv += valores.join(',') + '\n';
    });
    
    return csv;
}

/**
 * Descarga datos como archivo CSV
 * @param {Object[]} datos - Datos a exportar
 * @param {string} [nombreArchivo] - Nombre del archivo
 */
export function descargarCSV(datos, nombreArchivo = CONFIG.EXPORTACION.NOMBRE_ARCHIVO_DATOS) {
    const csv = exportarCSV(datos);
    const blob = new Blob([csv], { type: `text/csv;charset=${CONFIG.EXPORTACION.ENCODING};` });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nombreArchivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Calcula estadísticas descriptivas de una columna de los datos generados
 * @param {Object[]} datos - Datos generados
 * @param {string} columna - Nombre de la columna
 * @returns {Object|null} Estadísticas descriptivas o null si no hay datos
 */
export function obtenerEstadisticasColumna(datos, columna) {
    if (!datos || datos.length === 0) return null;
    
    const valores = datos
        .map(fila => fila[columna])
        .filter(v => v !== null && v !== undefined && !isNaN(v))
        .map(Number);
    
    if (valores.length === 0) return null;
    
    return calcularDescriptivas(valores);
}

/**
 * Obtiene los nombres de todas las columnas de los datos
 * @param {Object[]} datos - Datos generados
 * @returns {string[]} Lista de nombres de columnas
 */
export function obtenerNombresColumnas(datos) {
    if (!datos || datos.length === 0) return [];
    return Object.keys(datos[0]);
}

/**
 * Filtra las columnas numéricas de los datos
 * @param {Object[]} datos - Datos generados
 * @returns {string[]} Lista de nombres de columnas numéricas
 */
export function obtenerColumnasNumericas(datos) {
    if (!datos || datos.length === 0) return [];
    
    const primeraFila = datos[0];
    return Object.keys(primeraFila).filter(col => {
        const valor = primeraFila[col];
        return typeof valor === 'number' || !isNaN(parseFloat(valor));
    });
}

/**
 * Extrae los valores de una columna específica
 * @param {Object[]} datos - Datos generados
 * @param {string} columna - Nombre de la columna
 * @returns {number[]} Array de valores numéricos
 */
export function extraerValoresColumna(datos, columna) {
    return datos
        .map(fila => fila[columna])
        .filter(v => v !== null && v !== undefined && !isNaN(v))
        .map(Number);
}

export default {
    generarBaseDatos,
    generarPuntajesPrueba,
    procesarConfiguracionPruebas,
    procesarConfiguracionSociodemograficos,
    exportarCSV,
    descargarCSV,
    obtenerEstadisticasColumna,
    obtenerNombresColumnas,
    obtenerColumnasNumericas,
    extraerValoresColumna
};
