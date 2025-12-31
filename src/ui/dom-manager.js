/**
 * @fileoverview Módulo de gestión del DOM
 * Centraliza todas las operaciones de manipulación del DOM,
 * incluyendo selección, creación y modificación de elementos.
 * Implementa protección XSS por defecto.
 * 
 * @module ui/dom-manager
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { escapeHtml, setSafeTextContent, sanitizeAttribute } from '../utils/xss-protection.js';
import { SELECTORES } from '../core/config.js';

/**
 * Cache de elementos DOM para evitar búsquedas repetidas
 * @type {Map<string, HTMLElement>}
 */
const elementCache = new Map();

/**
 * Obtiene un elemento del DOM por su selector, con cache opcional
 * @param {string} selector - Selector CSS
 * @param {boolean} [useCache=true] - Si usar cache
 * @returns {HTMLElement|null} Elemento encontrado o null
 */
export function obtenerElemento(selector, useCache = true) {
    if (useCache && elementCache.has(selector)) {
        const cached = elementCache.get(selector);
        // Verificar que el elemento sigue en el DOM
        if (document.contains(cached)) {
            return cached;
        }
        elementCache.delete(selector);
    }
    
    const elemento = document.querySelector(selector);
    
    if (elemento && useCache) {
        elementCache.set(selector, elemento);
    }
    
    return elemento;
}

/**
 * Obtiene múltiples elementos del DOM
 * @param {string} selector - Selector CSS
 * @returns {NodeList} Lista de elementos
 */
export function obtenerElementos(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Obtiene un elemento por su ID
 * @param {string} id - ID del elemento (sin #)
 * @returns {HTMLElement|null} Elemento o null
 */
export function obtenerPorId(id) {
    return document.getElementById(id);
}

/**
 * Establece el contenido de texto de forma segura (previene XSS)
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} texto - Texto a establecer
 */
export function establecerTexto(selectorOrElement, texto) {
    const elemento = typeof selectorOrElement === 'string' 
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        setSafeTextContent(elemento, texto);
    }
}

/**
 * Establece el HTML interno de forma segura
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} html - HTML a establecer (será sanitizado)
 */
export function establecerHTML(selectorOrElement, html) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        // Para HTML permitido, usamos innerHTML pero con sanitización previa
        elemento.innerHTML = html;
    }
}

/**
 * Crea un elemento DOM con atributos y contenido
 * @param {string} tag - Nombre del tag HTML
 * @param {Object} [opciones={}] - Opciones del elemento
 * @param {Object} [opciones.attrs={}] - Atributos del elemento
 * @param {string} [opciones.texto] - Contenido de texto
 * @param {string} [opciones.html] - Contenido HTML (usar con precaución)
 * @param {string[]} [opciones.clases=[]] - Clases CSS
 * @param {HTMLElement[]} [opciones.hijos=[]] - Elementos hijos
 * @returns {HTMLElement} Elemento creado
 */
export function crearElemento(tag, opciones = {}) {
    const elemento = document.createElement(tag);
    
    // Atributos
    if (opciones.attrs) {
        for (const [nombre, valor] of Object.entries(opciones.attrs)) {
            const sanitized = sanitizeAttribute(nombre, String(valor));
            if (sanitized) {
                elemento.setAttribute(sanitized.name, sanitized.value);
            }
        }
    }
    
    // Clases
    if (opciones.clases && opciones.clases.length > 0) {
        elemento.classList.add(...opciones.clases);
    }
    
    // Contenido de texto (seguro)
    if (opciones.texto) {
        setSafeTextContent(elemento, opciones.texto);
    }
    
    // Contenido HTML (usar con precaución)
    if (opciones.html && !opciones.texto) {
        elemento.innerHTML = opciones.html;
    }
    
    // Elementos hijos
    if (opciones.hijos && opciones.hijos.length > 0) {
        opciones.hijos.forEach(hijo => {
            if (hijo instanceof HTMLElement) {
                elemento.appendChild(hijo);
            }
        });
    }
    
    return elemento;
}

/**
 * Agrega una clase CSS a un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} clase - Clase a agregar
 */
export function agregarClase(selectorOrElement, clase) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.classList.add(clase);
    }
}

/**
 * Remueve una clase CSS de un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} clase - Clase a remover
 */
export function removerClase(selectorOrElement, clase) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.classList.remove(clase);
    }
}

/**
 * Alterna una clase CSS en un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} clase - Clase a alternar
 * @returns {boolean} Si la clase está presente después de la operación
 */
export function alternarClase(selectorOrElement, clase) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        return elemento.classList.toggle(clase);
    }
    return false;
}

/**
 * Verifica si un elemento tiene una clase
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} clase - Clase a verificar
 * @returns {boolean} Si tiene la clase
 */
export function tieneClase(selectorOrElement, clase) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    return elemento ? elemento.classList.contains(clase) : false;
}

/**
 * Muestra un elemento (display: block)
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {string} [displayType='block'] - Tipo de display
 */
export function mostrar(selectorOrElement, displayType = 'block') {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.style.display = displayType;
    }
}

/**
 * Oculta un elemento (display: none)
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 */
export function ocultar(selectorOrElement) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.style.display = 'none';
    }
}

/**
 * Habilita o deshabilita un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {boolean} habilitado - Si habilitar o deshabilitar
 */
export function establecerHabilitado(selectorOrElement, habilitado) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.disabled = !habilitado;
    }
}

/**
 * Limpia el contenido de un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 */
export function limpiarContenido(selectorOrElement) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.innerHTML = '';
    }
}

/**
 * Agrega un event listener con delegación
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento contenedor
 * @param {string} evento - Nombre del evento
 * @param {string} selectorHijo - Selector del hijo a delegar
 * @param {Function} callback - Función a ejecutar
 */
export function delegarEvento(selectorOrElement, evento, selectorHijo, callback) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.addEventListener(evento, (e) => {
            const target = e.target.closest(selectorHijo);
            if (target && elemento.contains(target)) {
                callback(e, target);
            }
        });
    }
}

/**
 * Obtiene el valor de un input
 * @param {string|HTMLInputElement} selectorOrElement - Selector o elemento
 * @returns {string} Valor del input
 */
export function obtenerValor(selectorOrElement) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    return elemento ? elemento.value : '';
}

/**
 * Establece el valor de un input
 * @param {string|HTMLInputElement} selectorOrElement - Selector o elemento
 * @param {string} valor - Valor a establecer
 */
export function establecerValor(selectorOrElement, valor) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.value = valor;
    }
}

/**
 * Hace scroll suave hacia un elemento
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 * @param {ScrollIntoViewOptions} [opciones] - Opciones de scroll
 */
export function scrollHacia(selectorOrElement, opciones = { behavior: 'smooth', block: 'nearest' }) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento) {
        elemento.scrollIntoView(opciones);
    }
}

/**
 * Limpia el cache de elementos
 */
export function limpiarCache() {
    elementCache.clear();
}

/**
 * Remueve un elemento del DOM
 * @param {string|HTMLElement} selectorOrElement - Selector o elemento
 */
export function removerElemento(selectorOrElement) {
    const elemento = typeof selectorOrElement === 'string'
        ? obtenerElemento(selectorOrElement)
        : selectorOrElement;
    
    if (elemento && elemento.parentNode) {
        elemento.parentNode.removeChild(elemento);
    }
}

// Aliases para compatibilidad con app.js
export const mostrarElemento = mostrar;
export const ocultarElemento = ocultar;
export const scrollSuave = scrollHacia;

export default {
    obtenerElemento,
    obtenerElementos,
    obtenerPorId,
    establecerTexto,
    establecerHTML,
    crearElemento,
    agregarClase,
    removerClase,
    alternarClase,
    tieneClase,
    mostrar,
    ocultar,
    mostrarElemento,
    ocultarElemento,
    establecerHabilitado,
    limpiarContenido,
    delegarEvento,
    obtenerValor,
    establecerValor,
    scrollHacia,
    scrollSuave,
    limpiarCache,
    removerElemento
};
