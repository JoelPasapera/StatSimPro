/**
 * @fileoverview Módulo de gestión de formularios
 * Proporciona funciones para crear, validar y gestionar formularios dinámicos.
 * 
 * @module ui/forms
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { 
    obtenerElemento, 
    obtenerElementos, 
    crearElemento, 
    establecerTexto,
    agregarClase,
    removerClase,
    delegarEvento
} from './dom-manager.js';
import { escapeHtml, sanitizeObject } from '../utils/xss-protection.js';
import { mostrarToast, toastError, toastAdvertencia } from './toast.js';

/**
 * @typedef {Object} CampoConfig
 * @property {string} nombre - Nombre del campo
 * @property {string} tipo - Tipo de input: 'text', 'number', 'select', etc.
 * @property {string} label - Etiqueta del campo
 * @property {string} [placeholder] - Placeholder
 * @property {*} [valorDefecto] - Valor por defecto
 * @property {boolean} [requerido=false] - Si es obligatorio
 * @property {Object} [validacion] - Reglas de validación
 * @property {Array} [opciones] - Opciones para select
 */

/**
 * Recolecta todos los valores de un formulario
 * @param {string|HTMLFormElement} formulario - ID o elemento del formulario
 * @param {Object} [opciones] - Opciones de recolección
 * @param {boolean} [opciones.sanitizar=true] - Sanitizar valores contra XSS
 * @returns {Object} Objeto con los valores del formulario
 */
export function recolectarFormulario(formulario, opciones = {}) {
    const { sanitizar = true } = opciones;
    
    const form = typeof formulario === 'string' 
        ? obtenerElemento(`#${formulario}`) 
        : formulario;
        
    if (!form) {
        console.warn('Formulario no encontrado');
        return {};
    }
    
    const datos = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        const nombre = input.name || input.id;
        if (!nombre) return;
        
        let valor;
        
        switch (input.type) {
            case 'checkbox':
                valor = input.checked;
                break;
            case 'radio':
                if (input.checked) {
                    valor = input.value;
                }
                break;
            case 'number':
                valor = input.value ? parseFloat(input.value) : null;
                break;
            case 'file':
                valor = input.files;
                break;
            default:
                valor = input.value.trim();
        }
        
        if (valor !== undefined) {
            datos[nombre] = valor;
        }
    });
    
    return sanitizar ? sanitizeObject(datos) : datos;
}

/**
 * Recolecta datos de una tabla de configuración (filas dinámicas)
 * @param {string} tbodyId - ID del tbody
 * @param {string[]} campos - Nombres de los campos en orden de columna
 * @returns {Object[]} Array de objetos con los datos de cada fila
 */
export function recolectarTablaConfiguracion(tbodyId, campos) {
    const tbody = obtenerElemento(`#${tbodyId}`);
    if (!tbody) {
        console.warn(`Tbody no encontrado: ${tbodyId}`);
        return [];
    }
    
    const filas = tbody.querySelectorAll('tr');
    const datos = [];
    
    filas.forEach((fila, indexFila) => {
        const inputs = fila.querySelectorAll('input, select');
        const filaDatos = {};
        let tieneValores = false;
        
        inputs.forEach((input, indexInput) => {
            const nombreCampo = campos[indexInput] || `campo${indexInput}`;
            let valor;
            
            if (input.type === 'number') {
                valor = input.value ? parseFloat(input.value) : null;
            } else {
                valor = input.value.trim();
            }
            
            filaDatos[nombreCampo] = valor;
            
            // Verificar si la fila tiene al menos un valor
            if (valor !== null && valor !== '') {
                tieneValores = true;
            }
        });
        
        // Solo agregar filas con datos
        if (tieneValores) {
            filaDatos._index = indexFila;
            datos.push(filaDatos);
        }
    });
    
    return datos;
}

/**
 * Pobla un formulario con datos
 * @param {string|HTMLFormElement} formulario - ID o elemento del formulario
 * @param {Object} datos - Datos a establecer
 */
export function poblarFormulario(formulario, datos) {
    const form = typeof formulario === 'string'
        ? obtenerElemento(`#${formulario}`)
        : formulario;
        
    if (!form) return;
    
    Object.entries(datos).forEach(([nombre, valor]) => {
        const input = form.querySelector(`[name="${nombre}"], #${nombre}`);
        if (!input) return;
        
        switch (input.type) {
            case 'checkbox':
                input.checked = Boolean(valor);
                break;
            case 'radio':
                const radio = form.querySelector(`[name="${nombre}"][value="${valor}"]`);
                if (radio) radio.checked = true;
                break;
            default:
                input.value = valor ?? '';
        }
    });
}

/**
 * Limpia un formulario
 * @param {string|HTMLFormElement} formulario - ID o elemento del formulario
 */
export function limpiarFormulario(formulario) {
    const form = typeof formulario === 'string'
        ? obtenerElemento(`#${formulario}`)
        : formulario;
        
    if (form && typeof form.reset === 'function') {
        form.reset();
    }
}

/**
 * Pobla un select con opciones
 * @param {string|HTMLSelectElement} select - ID o elemento select
 * @param {Array<{value: string, label: string}>} opciones - Opciones
 * @param {Object} [config] - Configuración
 * @param {string} [config.placeholder] - Opción vacía inicial
 * @param {string} [config.valorSeleccionado] - Valor a preseleccionar
 */
export function poblarSelect(select, opciones, config = {}) {
    const elemento = typeof select === 'string'
        ? obtenerElemento(`#${select}`)
        : select;
        
    if (!elemento) return;
    
    // Limpiar opciones existentes
    elemento.innerHTML = '';
    
    // Agregar placeholder si existe
    if (config.placeholder) {
        const optionPlaceholder = crearElemento('option');
        optionPlaceholder.value = '';
        establecerTexto(optionPlaceholder, config.placeholder);
        elemento.appendChild(optionPlaceholder);
    }
    
    // Agregar opciones
    opciones.forEach(opcion => {
        const option = crearElemento('option');
        option.value = opcion.value;
        establecerTexto(option, opcion.label);
        
        if (config.valorSeleccionado === opcion.value) {
            option.selected = true;
        }
        
        elemento.appendChild(option);
    });
}

/**
 * Agrega una fila dinámica a una tabla de configuración
 * @param {string} tbodyId - ID del tbody
 * @param {string} claseFilaModelo - Clase de la fila modelo a clonar
 * @returns {HTMLElement|null} La nueva fila creada
 */
export function agregarFilaDinamica(tbodyId, claseFilaModelo) {
    const tbody = obtenerElemento(`#${tbodyId}`);
    if (!tbody) return null;
    
    const filaModelo = tbody.querySelector(`.${claseFilaModelo}`);
    if (!filaModelo) {
        console.warn(`Fila modelo no encontrada: ${claseFilaModelo}`);
        return null;
    }
    
    const nuevaFila = filaModelo.cloneNode(true);
    
    // Limpiar valores de inputs
    nuevaFila.querySelectorAll('input').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    nuevaFila.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    tbody.appendChild(nuevaFila);
    return nuevaFila;
}

/**
 * Elimina una fila dinámica con validación mínima
 * @param {HTMLElement} fila - Elemento de la fila a eliminar
 * @param {string} tbodyId - ID del tbody
 * @param {number} [minFilas=1] - Mínimo de filas a mantener
 * @returns {boolean} True si se eliminó correctamente
 */
export function eliminarFilaDinamica(fila, tbodyId, minFilas = 1) {
    const tbody = obtenerElemento(`#${tbodyId}`);
    if (!tbody || !fila) return false;
    
    const filasActuales = tbody.querySelectorAll('tr').length;
    
    if (filasActuales <= minFilas) {
        toastAdvertencia(`Debe haber al menos ${minFilas} fila(s)`);
        return false;
    }
    
    fila.remove();
    return true;
}

/**
 * Habilita/deshabilita un conjunto de inputs
 * @param {string} selector - Selector CSS de los inputs
 * @param {boolean} habilitado - True para habilitar, false para deshabilitar
 */
export function toggleInputs(selector, habilitado) {
    const inputs = obtenerElementos(selector);
    inputs.forEach(input => {
        input.disabled = !habilitado;
        
        if (habilitado) {
            removerClase(input, 'disabled');
        } else {
            agregarClase(input, 'disabled');
        }
    });
}

/**
 * Muestra un mensaje de error junto a un input
 * @param {string|HTMLElement} input - Input o su ID
 * @param {string} mensaje - Mensaje de error
 */
export function mostrarErrorInput(input, mensaje) {
    const elemento = typeof input === 'string'
        ? obtenerElemento(`#${input}`)
        : input;
        
    if (!elemento) return;
    
    agregarClase(elemento, 'input-error');
    
    // Crear o actualizar mensaje de error
    let errorSpan = elemento.parentElement?.querySelector('.error-message');
    if (!errorSpan) {
        errorSpan = crearElemento('span');
        agregarClase(errorSpan, 'error-message');
        elemento.parentElement?.appendChild(errorSpan);
    }
    
    establecerTexto(errorSpan, mensaje);
}

/**
 * Limpia el error de un input
 * @param {string|HTMLElement} input - Input o su ID
 */
export function limpiarErrorInput(input) {
    const elemento = typeof input === 'string'
        ? obtenerElemento(`#${input}`)
        : input;
        
    if (!elemento) return;
    
    removerClase(elemento, 'input-error');
    
    const errorSpan = elemento.parentElement?.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.remove();
    }
}

/**
 * Obtiene el valor seleccionado de un grupo de radio buttons
 * @param {string} nombre - Nombre del grupo de radio
 * @returns {string|null} Valor seleccionado o null
 */
export function obtenerRadioSeleccionado(nombre) {
    const seleccionado = document.querySelector(`input[name="${nombre}"]:checked`);
    return seleccionado ? seleccionado.value : null;
}

/**
 * Valida que un input tenga valor
 * @param {string|HTMLElement} input - Input o su ID
 * @param {string} [mensajeError] - Mensaje de error personalizado
 * @returns {boolean} True si tiene valor
 */
export function validarCampoRequerido(input, mensajeError = 'Este campo es requerido') {
    const elemento = typeof input === 'string'
        ? obtenerElemento(`#${input}`)
        : input;
        
    if (!elemento) return false;
    
    const valor = elemento.value?.trim();
    const esValido = valor !== '' && valor !== null && valor !== undefined;
    
    if (!esValido) {
        mostrarErrorInput(elemento, mensajeError);
    } else {
        limpiarErrorInput(elemento);
    }
    
    return esValido;
}

export default {
    recolectarFormulario,
    recolectarTablaConfiguracion,
    poblarFormulario,
    limpiarFormulario,
    poblarSelect,
    agregarFilaDinamica,
    eliminarFilaDinamica,
    toggleInputs,
    mostrarErrorInput,
    limpiarErrorInput,
    obtenerRadioSeleccionado,
    validarCampoRequerido
};
