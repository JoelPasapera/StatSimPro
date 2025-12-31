/**
 * @fileoverview Sistema de gestión de estado centralizado con Proxy reactivo
 * Implementa el patrón Store para manejar el estado de la aplicación de forma predecible
 * y reactiva, siguiendo los principios de arquitectura empresarial.
 * 
 * La reactividad se logra mediante Proxy de JavaScript, que intercepta cambios
 * y notifica automáticamente a los suscriptores cuando el estado cambia.
 * 
 * @module core/state
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { deepClone, deepMerge } from '../utils/helpers.js';

/**
 * @typedef {Object} StateListener
 * @property {string} id - Identificador único del listener
 * @property {string} key - Clave del estado que escucha (o '*' para todos)
 * @property {Function} callback - Función a ejecutar cuando cambia el estado
 */

/**
 * @typedef {Object} AppState
 * @property {Object} generador - Estado del generador de datos
 * @property {Object} analizador - Estado del analizador estadístico
 * @property {Object} ui - Estado de la interfaz de usuario
 */

/**
 * Estado inicial de la aplicación
 * Define la estructura completa del estado para toda la app
 * @type {AppState}
 */
const ESTADO_INICIAL = {
    // Estado del Generador de Datos
    generador: {
        tamanoMuestra: 100,
        pruebas: [],
        sociodemograficos: [],
        datosGenerados: null,
        configuracionValida: false
    },
    
    // Estado del Analizador Estadístico
    analizador: {
        datos: null,
        columnas: [],
        variable1: null,
        variable2: null,
        tipoPrueba: 'bilateral',
        unidadAnalisis: '',
        lugarContexto: '',
        dimensiones: {},
        resultados: null,
        configuracionInvestigacion: {
            tipoEstudio: 'correlacional',
            nivelSignificancia: 0.05
        }
    },
    
    // Estado de la UI
    ui: {
        seccionActiva: 'simulador',
        cargando: false,
        error: null,
        toast: null,
        previewVisible: false,
        resultadosVisibles: false
    }
};

/**
 * Almacén de listeners registrados para cambios de estado
 * @type {Map<string, StateListener>}
 */
const listeners = new Map();

/**
 * Contador para generar IDs únicos de listeners
 * @type {number}
 */
let listenerIdCounter = 0;

/**
 * Copia profunda del estado real (no expuesto directamente)
 * @type {AppState}
 */
let estadoInterno = deepClone(ESTADO_INICIAL);

/**
 * Notifica a todos los listeners relevantes sobre un cambio de estado
 * @param {string} key - Clave que cambió (puede ser 'generador.tamanoMuestra')
 * @param {*} newValue - Nuevo valor
 * @param {*} oldValue - Valor anterior
 */
function notificarCambio(key, newValue, oldValue) {
    const rootKey = key.split('.')[0];
    
    listeners.forEach(listener => {
        // Notificar si escucha esta clave específica, la clave raíz, o todos ('*')
        if (listener.key === key || 
            listener.key === rootKey || 
            listener.key === '*') {
            try {
                listener.callback({
                    key,
                    newValue,
                    oldValue,
                    state: deepClone(estadoInterno)
                });
            } catch (error) {
                console.error(`Error en listener "${listener.id}":`, error);
            }
        }
    });
}

/**
 * Crea un proxy reactivo para un objeto o sub-objeto del estado
 * @param {Object} target - Objeto a proxificar
 * @param {string} [path=''] - Ruta actual en el estado
 * @returns {Proxy} Objeto proxificado
 */
function crearProxyReactivo(target, path = '') {
    return new Proxy(target, {
        get(obj, prop) {
            const value = obj[prop];
            
            // Si es un objeto, retornar un proxy anidado
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                const newPath = path ? `${path}.${String(prop)}` : String(prop);
                return crearProxyReactivo(value, newPath);
            }
            
            return value;
        },
        
        set(obj, prop, value) {
            const currentPath = path ? `${path}.${String(prop)}` : String(prop);
            const oldValue = deepClone(obj[prop]);
            
            // Solo actualizar si el valor realmente cambió
            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                obj[prop] = value;
                notificarCambio(currentPath, value, oldValue);
            }
            
            return true;
        },
        
        deleteProperty(obj, prop) {
            const currentPath = path ? `${path}.${String(prop)}` : String(prop);
            const oldValue = deepClone(obj[prop]);
            
            if (prop in obj) {
                delete obj[prop];
                notificarCambio(currentPath, undefined, oldValue);
            }
            
            return true;
        }
    });
}

/**
 * Estado reactivo de la aplicación
 * Modificaciones a este objeto disparan automáticamente actualizaciones
 * @type {AppState}
 */
export const estado = crearProxyReactivo(estadoInterno);

/**
 * Suscribe una función callback a cambios en el estado
 * @param {string} key - Clave del estado a observar ('*' para todos los cambios)
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 * @returns {string} ID del listener (usar para desuscribirse)
 * @example
 * // Escuchar cambios en el tamaño de muestra
 * const id = suscribir('generador.tamanoMuestra', ({ newValue }) => {
 *     console.log('Nuevo tamaño:', newValue);
 * });
 */
export function suscribir(key, callback) {
    const id = `listener_${++listenerIdCounter}`;
    
    listeners.set(id, {
        id,
        key,
        callback
    });
    
    return id;
}

/**
 * Cancela la suscripción de un listener
 * @param {string} id - ID del listener a remover
 * @returns {boolean} True si se removió exitosamente
 */
export function desuscribir(id) {
    return listeners.delete(id);
}

/**
 * Obtiene una copia del estado actual (solo lectura)
 * @returns {AppState} Copia profunda del estado
 */
export function obtenerEstado() {
    return deepClone(estadoInterno);
}

/**
 * Actualiza múltiples propiedades del estado de forma atómica
 * Útil para evitar múltiples re-renders cuando se cambian varias propiedades
 * @param {Object} cambios - Objeto con las propiedades a cambiar
 * @example
 * actualizarEstado({
 *     'generador.tamanoMuestra': 150,
 *     'generador.configuracionValida': true
 * });
 */
export function actualizarEstado(cambios) {
    // Suspender notificaciones temporalmente
    const notificacionesPendientes = [];
    
    Object.entries(cambios).forEach(([path, value]) => {
        const keys = path.split('.');
        let target = estadoInterno;
        
        // Navegar al objeto padre
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in target)) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = deepClone(target[lastKey]);
        
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
            target[lastKey] = value;
            notificacionesPendientes.push({ key: path, newValue: value, oldValue });
        }
    });
    
    // Notificar todos los cambios
    notificacionesPendientes.forEach(({ key, newValue, oldValue }) => {
        notificarCambio(key, newValue, oldValue);
    });
}

/**
 * Reinicia el estado a sus valores iniciales
 * @param {string} [seccion] - Sección específica a reiniciar (opcional)
 */
export function reiniciarEstado(seccion) {
    if (seccion && seccion in ESTADO_INICIAL) {
        const oldValue = deepClone(estadoInterno[seccion]);
        estadoInterno[seccion] = deepClone(ESTADO_INICIAL[seccion]);
        notificarCambio(seccion, estadoInterno[seccion], oldValue);
    } else {
        const oldState = deepClone(estadoInterno);
        estadoInterno = deepClone(ESTADO_INICIAL);
        notificarCambio('*', estadoInterno, oldState);
    }
}

/**
 * Obtiene un valor específico del estado por su ruta
 * @param {string} path - Ruta al valor (ej: 'generador.tamanoMuestra')
 * @param {*} [defaultValue] - Valor por defecto si no existe
 * @returns {*} Valor encontrado o defaultValue
 */
export function obtenerValor(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = estadoInterno;
    
    for (const key of keys) {
        if (value === null || value === undefined || !(key in value)) {
            return defaultValue;
        }
        value = value[key];
    }
    
    return value !== undefined ? deepClone(value) : defaultValue;
}

/**
 * Verifica si existe una clave en el estado
 * @param {string} path - Ruta a verificar
 * @returns {boolean} True si existe
 */
export function existeEnEstado(path) {
    const keys = path.split('.');
    let target = estadoInterno;
    
    for (const key of keys) {
        if (target === null || target === undefined || !(key in target)) {
            return false;
        }
        target = target[key];
    }
    
    return true;
}

/**
 * Middleware para logging de cambios (útil para debugging)
 * @param {boolean} activar - Si activar o desactivar el logging
 * @returns {string|null} ID del listener si se activó, null si se desactivó
 */
let debugListenerId = null;

export function activarDebugMode(activar = true) {
    if (activar && !debugListenerId) {
        debugListenerId = suscribir('*', ({ key, newValue, oldValue }) => {
            console.group(`🔄 Estado: ${key}`);
            console.log('Anterior:', oldValue);
            console.log('Nuevo:', newValue);
            console.groupEnd();
        });
        console.log('🐛 Debug mode activado');
        return debugListenerId;
    } else if (!activar && debugListenerId) {
        desuscribir(debugListenerId);
        debugListenerId = null;
        console.log('🐛 Debug mode desactivado');
    }
    return debugListenerId;
}

export default {
    estado,
    suscribir,
    desuscribir,
    obtenerEstado,
    actualizarEstado,
    reiniciarEstado,
    obtenerValor,
    existeEnEstado,
    activarDebugMode
};
