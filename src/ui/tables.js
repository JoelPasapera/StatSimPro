/**
 * @fileoverview Módulo de gestión de tablas dinámicas
 * Proporciona funciones para crear, poblar y manipular tablas HTML de forma segura.
 * 
 * @module ui/tables
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { crearElemento, establecerTexto, limpiarElemento, obtenerElemento } from './dom-manager.js';
import { escapeHtml } from '../utils/xss-protection.js';
import { formatearNumero } from '../utils/helpers.js';

/**
 * @typedef {Object} ColumnaConfig
 * @property {string} key - Clave del dato en el objeto
 * @property {string} header - Texto del encabezado
 * @property {string} [tipo='texto'] - Tipo de dato: 'texto', 'numero', 'fecha', 'accion'
 * @property {number} [decimales=2] - Decimales para números
 * @property {Function} [render] - Función de renderizado personalizado
 * @property {string} [clase] - Clase CSS adicional
 */

/**
 * @typedef {Object} TablaConfig
 * @property {string} containerId - ID del contenedor de la tabla
 * @property {string} [theadId] - ID del thead (si está separado)
 * @property {string} [tbodyId] - ID del tbody (si está separado)
 * @property {ColumnaConfig[]} columnas - Configuración de columnas
 * @property {number} [maxFilas] - Máximo de filas a mostrar
 * @property {boolean} [mostrarIndice=false] - Mostrar número de fila
 * @property {string} [claseTabla='table'] - Clase CSS de la tabla
 */

/**
 * Crea los encabezados de una tabla
 * @param {HTMLElement} thead - Elemento thead
 * @param {ColumnaConfig[]} columnas - Configuración de columnas
 * @param {boolean} [mostrarIndice=false] - Si mostrar columna de índice
 */
export function crearEncabezados(thead, columnas, mostrarIndice = false) {
    limpiarElemento(thead);
    
    const filaEncabezados = crearElemento('tr');
    
    // Columna de índice si aplica
    if (mostrarIndice) {
        const thIndice = crearElemento('th');
        establecerTexto(thIndice, '#');
        filaEncabezados.appendChild(thIndice);
    }
    
    // Columnas configuradas
    columnas.forEach(columna => {
        const th = crearElemento('th');
        establecerTexto(th, columna.header);
        
        if (columna.clase) {
            th.className = columna.clase;
        }
        
        filaEncabezados.appendChild(th);
    });
    
    thead.appendChild(filaEncabezados);
}

/**
 * Pobla el cuerpo de una tabla con datos
 * @param {HTMLElement} tbody - Elemento tbody
 * @param {Object[]} datos - Array de objetos con los datos
 * @param {ColumnaConfig[]} columnas - Configuración de columnas
 * @param {Object} [opciones] - Opciones adicionales
 * @param {number} [opciones.maxFilas] - Máximo de filas
 * @param {boolean} [opciones.mostrarIndice=false] - Mostrar índice
 */
export function poblarTabla(tbody, datos, columnas, opciones = {}) {
    const { maxFilas, mostrarIndice = false } = opciones;
    limpiarElemento(tbody);
    
    // Limitar filas si aplica
    const datosAMostrar = maxFilas ? datos.slice(0, maxFilas) : datos;
    
    datosAMostrar.forEach((fila, index) => {
        const tr = crearElemento('tr');
        
        // Columna de índice
        if (mostrarIndice) {
            const tdIndice = crearElemento('td');
            establecerTexto(tdIndice, String(index + 1));
            tr.appendChild(tdIndice);
        }
        
        // Columnas de datos
        columnas.forEach(columna => {
            const td = crearElemento('td');
            const valor = fila[columna.key];
            
            // Renderizado personalizado o por tipo
            if (columna.render) {
                const contenido = columna.render(valor, fila, index);
                if (typeof contenido === 'string') {
                    td.innerHTML = contenido; // El render debe retornar HTML seguro
                } else if (contenido instanceof HTMLElement) {
                    td.appendChild(contenido);
                }
            } else {
                const valorFormateado = formatearValorCelda(valor, columna);
                establecerTexto(td, valorFormateado);
            }
            
            if (columna.clase) {
                td.className = columna.clase;
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

/**
 * Formatea el valor de una celda según su tipo
 * @param {*} valor - Valor a formatear
 * @param {ColumnaConfig} columna - Configuración de la columna
 * @returns {string} Valor formateado
 */
function formatearValorCelda(valor, columna) {
    if (valor === null || valor === undefined) {
        return '-';
    }
    
    switch (columna.tipo) {
        case 'numero':
            const num = parseFloat(valor);
            if (isNaN(num)) return '-';
            return formatearNumero(num, columna.decimales ?? 2);
            
        case 'fecha':
            try {
                return new Date(valor).toLocaleDateString('es-PE');
            } catch {
                return String(valor);
            }
            
        case 'porcentaje':
            const pct = parseFloat(valor);
            if (isNaN(pct)) return '-';
            return `${formatearNumero(pct * 100, columna.decimales ?? 1)}%`;
            
        default:
            return String(valor);
    }
}

/**
 * Crea una tabla completa con encabezados y datos
 * @param {TablaConfig} config - Configuración de la tabla
 * @param {Object[]} datos - Datos a mostrar
 * @returns {HTMLTableElement} Tabla creada
 */
export function crearTabla(config, datos) {
    const tabla = crearElemento('table');
    tabla.className = config.claseTabla || 'table';
    
    const thead = crearElemento('thead');
    const tbody = crearElemento('tbody');
    
    crearEncabezados(thead, config.columnas, config.mostrarIndice);
    poblarTabla(tbody, datos, config.columnas, {
        maxFilas: config.maxFilas,
        mostrarIndice: config.mostrarIndice
    });
    
    tabla.appendChild(thead);
    tabla.appendChild(tbody);
    
    return tabla;
}

/**
 * Actualiza una tabla existente con nuevos datos
 * @param {string} tbodyId - ID del tbody a actualizar
 * @param {Object[]} datos - Nuevos datos
 * @param {ColumnaConfig[]} columnas - Configuración de columnas
 * @param {Object} [opciones] - Opciones adicionales
 */
export function actualizarTabla(tbodyId, datos, columnas, opciones = {}) {
    const tbody = obtenerElemento(`#${tbodyId}`);
    if (!tbody) {
        console.warn(`Tbody no encontrado: ${tbodyId}`);
        return;
    }
    
    poblarTabla(tbody, datos, columnas, opciones);
}

/**
 * Crea una tabla de resultados estadísticos (clave-valor)
 * @param {Object[]} resultados - Array de {label, valor, clase?}
 * @returns {HTMLTableElement} Tabla de resultados
 */
export function crearTablaResultados(resultados) {
    const tabla = crearElemento('table');
    tabla.className = 'result-table';
    
    resultados.forEach(({ label, valor, clase }) => {
        const tr = crearElemento('tr');
        
        const tdLabel = crearElemento('td');
        establecerTexto(tdLabel, label);
        
        const tdValor = crearElemento('td');
        if (clase) {
            tdValor.className = clase;
        }
        
        // Si el valor es un elemento HTML, agregarlo directamente
        if (valor instanceof HTMLElement) {
            tdValor.appendChild(valor);
        } else {
            establecerTexto(tdValor, String(valor));
        }
        
        tr.appendChild(tdLabel);
        tr.appendChild(tdValor);
        tabla.appendChild(tr);
    });
    
    return tabla;
}

/**
 * Genera encabezados dinámicamente desde los datos
 * @param {Object[]} datos - Array de objetos
 * @returns {ColumnaConfig[]} Configuración de columnas inferida
 */
export function inferirColumnas(datos) {
    if (!datos || datos.length === 0) return [];
    
    const primeraFila = datos[0];
    return Object.keys(primeraFila).map(key => ({
        key,
        header: key,
        tipo: typeof primeraFila[key] === 'number' ? 'numero' : 'texto'
    }));
}

/**
 * Exporta datos de tabla a CSV
 * @param {Object[]} datos - Datos a exportar
 * @param {ColumnaConfig[]} columnas - Columnas a incluir
 * @returns {string} Contenido CSV
 */
export function tablaACSV(datos, columnas) {
    // Encabezados
    const headers = columnas.map(col => escapeCSV(col.header));
    const lineas = [headers.join(',')];
    
    // Datos
    datos.forEach(fila => {
        const valores = columnas.map(col => {
            const valor = fila[col.key];
            return escapeCSV(formatearValorCelda(valor, col));
        });
        lineas.push(valores.join(','));
    });
    
    return lineas.join('\n');
}

/**
 * Escapa un valor para CSV
 * @param {string} valor - Valor a escapar
 * @returns {string} Valor escapado
 */
function escapeCSV(valor) {
    const str = String(valor ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export default {
    crearEncabezados,
    poblarTabla,
    crearTabla,
    actualizarTabla,
    crearTablaResultados,
    inferirColumnas,
    tablaACSV
};
