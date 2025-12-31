/**
 * @fileoverview Módulo de gestión de navegación
 * Maneja la navegación entre secciones de la aplicación SPA.
 * 
 * @module ui/navigation
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { 
    obtenerElemento, 
    obtenerElementos, 
    agregarClase, 
    removerClase,
    delegarEvento 
} from './dom-manager.js';
import { store } from '../core/state.js';
import { SELECTORES } from '../core/config.js';

/**
 * @typedef {Object} SeccionConfig
 * @property {string} id - ID de la sección
 * @property {string} titulo - Título de la sección
 * @property {Function} [onActivar] - Callback al activar sección
 * @property {Function} [onDesactivar] - Callback al desactivar sección
 */

/**
 * Registro de secciones configuradas
 * @type {Map<string, SeccionConfig>}
 */
const seccionesRegistradas = new Map();

/**
 * Inicializa el sistema de navegación
 * @param {Object} [opciones] - Opciones de configuración
 * @param {string} [opciones.seccionInicial='simulador'] - Sección inicial a mostrar
 */
export function inicializarNavegacion(opciones = {}) {
    const { seccionInicial = 'simulador' } = opciones;
    
    // Configurar delegación de eventos para links de navegación
    delegarEvento(
        document.body,
        'click',
        '.nav-link',
        manejarClickNavegacion
    );
    
    // Activar sección inicial
    navegarA(seccionInicial);
    
    // Suscribirse a cambios de estado
    store.subscribe('seccionActiva', (nuevaSeccion) => {
        actualizarUINavegacion(nuevaSeccion);
    });
}

/**
 * Maneja el click en un enlace de navegación
 * @param {Event} evento - Evento de click
 * @param {HTMLElement} link - Elemento del enlace
 */
function manejarClickNavegacion(evento, link) {
    evento.preventDefault();
    
    // Buscar data-section primero, luego href como fallback
    const seccionId = link.getAttribute('data-section') || link.getAttribute('href');
    if (!seccionId) return;
    
    // Si es href, quitar el #
    const seccionFinal = seccionId.startsWith('#') ? seccionId.substring(1) : seccionId;
    navegarA(seccionFinal);
}

/**
 * Navega a una sección específica
 * @param {string} seccionId - ID de la sección a mostrar
 * @returns {boolean} True si la navegación fue exitosa
 */
export function navegarA(seccionId) {
    // Buscar sección por ID directo o con prefijo "seccion-"
    let seccion = obtenerElemento(`#${seccionId}`);
    if (!seccion) {
        seccion = obtenerElemento(`#seccion-${seccionId}`);
    }
    
    if (!seccion) {
        console.warn(`Sección no encontrada: ${seccionId}`);
        return false;
    }
    
    // Obtener sección actual
    const seccionActual = store.getState().seccionActiva;
    
    // Ejecutar callback de desactivación si existe
    if (seccionActual && seccionesRegistradas.has(seccionActual)) {
        const config = seccionesRegistradas.get(seccionActual);
        if (config.onDesactivar) {
            config.onDesactivar();
        }
    }
    
    // Actualizar estado
    store.setState({ seccionActiva: seccionId });
    
    // Ejecutar callback de activación si existe
    if (seccionesRegistradas.has(seccionId)) {
        const config = seccionesRegistradas.get(seccionId);
        if (config.onActivar) {
            config.onActivar();
        }
    }
    
    return true;
}

/**
 * Actualiza la UI de navegación según la sección activa
 * @param {string} seccionId - ID de la sección activa
 */
function actualizarUINavegacion(seccionId) {
    // Actualizar links de navegación
    const navLinks = obtenerElementos('.nav-link');
    navLinks.forEach(link => {
        // Buscar data-section primero, luego href como fallback
        const dataSection = link.getAttribute('data-section');
        const href = link.getAttribute('href');
        const linkSeccion = dataSection || (href?.startsWith('#') ? href.substring(1) : href);
        
        if (linkSeccion === seccionId) {
            agregarClase(link, 'active');
            link.setAttribute('aria-current', 'page');
        } else {
            removerClase(link, 'active');
            link.removeAttribute('aria-current');
        }
    });
    
    // Actualizar visibilidad de secciones
    const secciones = obtenerElementos('.section');
    secciones.forEach(seccion => {
        // Buscar por ID exacto o por ID con prefijo "seccion-"
        const esActiva = seccion.id === seccionId || seccion.id === `seccion-${seccionId}`;
        
        if (esActiva) {
            agregarClase(seccion, 'active');
            seccion.removeAttribute('hidden');
        } else {
            removerClase(seccion, 'active');
            seccion.setAttribute('hidden', '');
        }
    });
    
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Registra una sección con configuración personalizada
 * @param {SeccionConfig} config - Configuración de la sección
 */
export function registrarSeccion(config) {
    if (!config.id) {
        throw new Error('La configuración de sección debe incluir un ID');
    }
    seccionesRegistradas.set(config.id, config);
}

/**
 * Obtiene la sección activa actual
 * @returns {string|null} ID de la sección activa
 */
export function obtenerSeccionActiva() {
    return store.getState().seccionActiva || null;
}

/**
 * Navega a la sección anterior en el historial
 */
export function navegarAtras() {
    window.history.back();
}

/**
 * Configura la navegación basada en hash para compartir URLs
 */
export function habilitarNavegacionHash() {
    // Manejar cambios de hash
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            navegarA(hash);
        }
    });
    
    // Verificar hash inicial
    const hashInicial = window.location.hash.substring(1);
    if (hashInicial) {
        navegarA(hashInicial);
    }
}

export default {
    inicializarNavegacion,
    navegarA,
    registrarSeccion,
    obtenerSeccionActiva,
    navegarAtras,
    habilitarNavegacionHash
};
