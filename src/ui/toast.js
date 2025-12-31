/**
 * @fileoverview Módulo de notificaciones toast
 * Sistema de notificaciones no intrusivas para feedback al usuario.
 * 
 * @module ui/toast
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { obtenerElemento, agregarClase, removerClase, establecerTexto } from './dom-manager.js';
import { SELECTORES, CONFIG } from '../core/config.js';

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} TipoToast
 */

/**
 * Cola de toasts pendientes
 * @type {Array<{mensaje: string, tipo: TipoToast}>}
 */
let colaToasts = [];

/**
 * Si actualmente se está mostrando un toast
 * @type {boolean}
 */
let mostrandoToast = false;

/**
 * Timeout actual del toast
 * @type {number|null}
 */
let toastTimeout = null;

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {TipoToast} [tipo='success'] - Tipo de notificación
 * @param {number} [duracion] - Duración en ms (opcional)
 */
export function mostrarToast(mensaje, tipo = 'success', duracion = CONFIG.UI.TOAST_DURACION) {
    // Agregar a la cola
    colaToasts.push({ mensaje, tipo, duracion });
    
    // Si no hay toast activo, procesar cola
    if (!mostrandoToast) {
        procesarColaToasts();
    }
}

/**
 * Procesa la cola de toasts
 */
function procesarColaToasts() {
    if (colaToasts.length === 0) {
        mostrandoToast = false;
        return;
    }
    
    mostrandoToast = true;
    const { mensaje, tipo, duracion } = colaToasts.shift();
    
    const toast = obtenerElemento(SELECTORES.TOAST);
    if (!toast) {
        console.warn('Elemento toast no encontrado');
        mostrandoToast = false;
        return;
    }
    
    // Limpiar clases previas
    toast.className = 'toast';
    
    // Establecer contenido y tipo
    establecerTexto(toast, mensaje);
    agregarClase(toast, tipo);
    agregarClase(toast, 'show');
    
    // Programar ocultamiento
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toastTimeout = setTimeout(() => {
        removerClase(toast, 'show');
        
        // Esperar a que termine la animación antes de procesar el siguiente
        setTimeout(() => {
            procesarColaToasts();
        }, 300);
    }, duracion);
}

/**
 * Oculta el toast actual inmediatamente
 */
export function ocultarToast() {
    const toast = obtenerElemento(SELECTORES.TOAST);
    if (toast) {
        removerClase(toast, 'show');
    }
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    
    mostrandoToast = false;
    colaToasts = [];
}

/**
 * Muestra un toast de éxito
 * @param {string} mensaje - Mensaje a mostrar
 */
export function toastExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

/**
 * Muestra un toast de error
 * @param {string} mensaje - Mensaje a mostrar
 */
export function toastError(mensaje) {
    mostrarToast(mensaje, 'error');
}

/**
 * Muestra un toast de advertencia
 * @param {string} mensaje - Mensaje a mostrar
 */
export function toastAdvertencia(mensaje) {
    mostrarToast(mensaje, 'warning');
}

/**
 * Muestra un toast informativo
 * @param {string} mensaje - Mensaje a mostrar
 */
export function toastInfo(mensaje) {
    mostrarToast(mensaje, 'info');
}

export default {
    mostrarToast,
    ocultarToast,
    toastExito,
    toastError,
    toastAdvertencia,
    toastInfo
};
