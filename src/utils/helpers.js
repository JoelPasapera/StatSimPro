/**
 * @fileoverview Funciones utilitarias generales reutilizables en toda la aplicación
 * @module utils/helpers
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

/**
 * Genera un ID único usando timestamp y valores aleatorios
 * Útil para identificar elementos dinámicos sin colisiones
 * @returns {string} ID único en formato 'id_timestamp_random'
 */
export function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `id_${timestamp}_${random}`;
}

/**
 * Formatea un número con cantidad específica de decimales
 * @param {number} numero - Número a formatear
 * @param {number} [decimales=2] - Cantidad de decimales
 * @returns {string} Número formateado como string
 * @example
 * formatearNumero(3.14159, 2) // "3.14"
 */
export function formatearNumero(numero, decimales = 2) {
    if (typeof numero !== 'number' || isNaN(numero)) {
        return '0'.padEnd(decimales + 2, '0');
    }
    return numero.toFixed(decimales);
}

/**
 * Formatea un p-valor para presentación científica
 * Muestra "< .001" para valores muy pequeños
 * @param {number} p - P-valor a formatear
 * @returns {string} P-valor formateado
 */
export function formatearPValor(p) {
    if (typeof p !== 'number' || isNaN(p)) {
        return 'N/A';
    }
    if (p < 0.001) return '< .001';
    if (p < 0.01) return p.toFixed(3);
    return p.toFixed(4);
}

/**
 * Debounce: Retrasa la ejecución de una función hasta que haya pasado
 * un tiempo sin que se vuelva a llamar. Útil para optimizar eventos
 * frecuentes como scroll o resize.
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Milisegundos de espera
 * @returns {Function} Función con debounce aplicado
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle: Limita la frecuencia de ejecución de una función
 * Garantiza que se ejecute como máximo una vez cada X ms
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Intervalo mínimo entre ejecuciones (ms)
 * @returns {Function} Función con throttle aplicado
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Deep clone de un objeto usando estructuras JSON
 * No funciona con funciones, fechas, undefined, etc.
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Copia profunda del objeto
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge profundo de dos objetos
 * @param {Object} target - Objeto destino
 * @param {Object} source - Objeto fuente
 * @returns {Object} Objeto resultante con merge
 */
export function deepMerge(target, source) {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
}

/**
 * Verifica si un valor es un objeto plano
 * @param {*} item - Valor a verificar
 * @returns {boolean} True si es un objeto plano
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Genera un nombre corto a partir de un nombre largo
 * Toma las iniciales de cada palabra
 * @param {string} nombre - Nombre completo
 * @param {number} [maxLength=10] - Longitud máxima del resultado
 * @returns {string} Nombre corto con iniciales
 */
export function generarNombreCorto(nombre, maxLength = 10) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
        return '';
    }
    
    const corto = nombre
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(palabra => palabra.charAt(0).toUpperCase())
        .join('');
    
    return corto.substring(0, maxLength);
}

/**
 * Retrasa la ejecución por un tiempo determinado (para async/await)
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>} Promesa que se resuelve después del delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena con primera letra mayúscula
 */
export function capitalize(str) {
    if (typeof str !== 'string' || !str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca una cadena a una longitud máxima con puntos suspensivos
 * @param {string} str - Cadena a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Cadena truncada
 */
export function truncate(str, maxLength) {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Obtiene la fecha actual formateada
 * @param {string} [locale='es-ES'] - Locale para formateo
 * @returns {string} Fecha formateada
 */
export function getFechaActual(locale = 'es-ES') {
    return new Date().toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Compara dos valores para ordenamiento
 * Útil para Array.sort()
 * @param {*} a - Primer valor
 * @param {*} b - Segundo valor
 * @param {boolean} [ascending=true] - Orden ascendente o descendente
 * @returns {number} -1, 0, o 1 según la comparación
 */
export function compareValues(a, b, ascending = true) {
    const modifier = ascending ? 1 : -1;
    
    if (a === null || a === undefined) return 1 * modifier;
    if (b === null || b === undefined) return -1 * modifier;
    
    if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * modifier;
    }
    
    return String(a).localeCompare(String(b)) * modifier;
}

/**
 * Agrupa un array de objetos por una propiedad
 * @param {Array<Object>} array - Array a agrupar
 * @param {string} key - Propiedad por la cual agrupar
 * @returns {Object} Objeto con grupos
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        result[group] = result[group] || [];
        result[group].push(item);
        return result;
    }, {});
}

export default {
    generateUniqueId,
    formatearNumero,
    formatearPValor,
    debounce,
    throttle,
    deepClone,
    deepMerge,
    isObject,
    generarNombreCorto,
    delay,
    capitalize,
    truncate,
    getFechaActual,
    compareValues,
    groupBy
};
