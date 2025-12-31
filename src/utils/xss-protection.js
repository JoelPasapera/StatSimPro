/**
 * @fileoverview Módulo de protección contra ataques XSS (Cross-Site Scripting)
 * Provee funciones para sanitizar entrada de usuario y prevenir inyección de código malicioso.
 * @module utils/xss-protection
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

/**
 * Mapa de caracteres HTML peligrosos y sus entidades seguras.
 * Estos caracteres pueden ser usados para inyectar scripts maliciosos.
 * @type {Object.<string, string>}
 */
const HTML_ENTITIES = Object.freeze({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
});

/**
 * Expresión regular para detectar caracteres HTML peligrosos
 * @type {RegExp}
 */
const UNSAFE_CHARS_REGEX = /[&<>"'`=/]/g;

/**
 * Expresión regular para detectar posibles inyecciones de script
 * @type {RegExp}
 */
const SCRIPT_INJECTION_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

/**
 * Expresión regular para detectar eventos JavaScript inline
 * @type {RegExp}
 */
const INLINE_EVENT_REGEX = /\bon\w+\s*=/gi;

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena con caracteres HTML escapados
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Retorna: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 */
export function escapeHtml(str) {
    if (typeof str !== 'string') {
        return String(str ?? '');
    }
    return str.replace(UNSAFE_CHARS_REGEX, char => HTML_ENTITIES[char] || char);
}

/**
 * Sanitiza una cadena removiendo tags HTML y scripts potencialmente peligrosos
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena limpia sin tags HTML
 */
export function stripHtml(str) {
    if (typeof str !== 'string') {
        return String(str ?? '');
    }
    return str
        .replace(SCRIPT_INJECTION_REGEX, '')
        .replace(/<[^>]*>/g, '')
        .replace(INLINE_EVENT_REGEX, '');
}

/**
 * Sanitiza un objeto completo, escapando todos sus valores string
 * Útil para sanitizar datos de formularios antes de procesarlos
 * @param {Object} obj - Objeto con datos a sanitizar
 * @returns {Object} Nuevo objeto con valores sanitizados
 */
export function sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[escapeHtml(key)] = escapeHtml(value);
        } else if (typeof value === 'object') {
            sanitized[escapeHtml(key)] = sanitizeObject(value);
        } else {
            sanitized[escapeHtml(key)] = value;
        }
    }
    return sanitized;
}

/**
 * Valida si una cadena contiene posibles intentos de XSS
 * @param {string} str - Cadena a validar
 * @returns {boolean} True si la cadena es segura, false si contiene patrones sospechosos
 */
export function isXssSafe(str) {
    if (typeof str !== 'string') {
        return true;
    }
    
    const hasScriptTags = SCRIPT_INJECTION_REGEX.test(str);
    const hasInlineEvents = INLINE_EVENT_REGEX.test(str);
    const hasHtmlTags = /<[^>]+>/g.test(str);
    
    return !hasScriptTags && !hasInlineEvents && !hasHtmlTags;
}

/**
 * Crea un elemento de texto seguro para insertar en el DOM
 * Usa createTextNode para garantizar que el contenido no sea interpretado como HTML
 * @param {string} text - Texto a insertar
 * @returns {Text} Nodo de texto seguro
 */
export function createSafeTextNode(text) {
    return document.createTextNode(String(text ?? ''));
}

/**
 * Establece el contenido de texto de un elemento de forma segura
 * Usa textContent en lugar de innerHTML para prevenir XSS
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} text - Texto a establecer
 */
export function setSafeTextContent(element, text) {
    if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.textContent = String(text ?? '');
    }
}

/**
 * Sanitiza una URL para prevenir ataques javascript:
 * @param {string} url - URL a sanitizar
 * @returns {string} URL segura o cadena vacía si es peligrosa
 */
export function sanitizeUrl(url) {
    if (typeof url !== 'string') {
        return '';
    }
    
    const trimmedUrl = url.trim().toLowerCase();
    
    // Bloquear protocolos peligrosos
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
    for (const protocol of dangerousProtocols) {
        if (trimmedUrl.startsWith(protocol)) {
            return '';
        }
    }
    
    return url;
}

/**
 * Sanitiza atributos antes de establecerlos en un elemento
 * @param {string} attrName - Nombre del atributo
 * @param {string} attrValue - Valor del atributo
 * @returns {Object} Objeto con nombre y valor sanitizados, o null si es peligroso
 */
export function sanitizeAttribute(attrName, attrValue) {
    const safeName = escapeHtml(attrName.toLowerCase());
    
    // Bloquear atributos de eventos
    if (safeName.startsWith('on')) {
        return null;
    }
    
    // Sanitizar URLs en atributos href y src
    if (['href', 'src', 'action'].includes(safeName)) {
        return {
            name: safeName,
            value: sanitizeUrl(attrValue)
        };
    }
    
    return {
        name: safeName,
        value: escapeHtml(attrValue)
    };
}

export default {
    escapeHtml,
    stripHtml,
    sanitizeObject,
    isXssSafe,
    createSafeTextNode,
    setSafeTextContent,
    sanitizeUrl,
    sanitizeAttribute
};
