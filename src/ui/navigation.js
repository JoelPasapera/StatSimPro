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
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Extraer ID de sección (quitar el #)
    const seccionId = href.startsWith('#') ? href.substring(1) : href;
    navegarA(seccionId);
}

/**
 * Navega a una sección específica
 * @param {string} seccionId - ID de la sección a mostrar
 * @returns {boolean} True si la navegación fue exitosa
 */
export function navegarA(seccionId) {
    const seccion = obtenerElemento(`#${seccionId}`);
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
        const href = link.getAttribute('href');
        const linkSeccion = href?.startsWith('#') ? href.substring(1) : href;
        
        if (linkSeccion === seccionId) {
            agregarClase(link, 'active');
        } else {
            removerClase(link, 'active');
        }
    });
    
    // Actualizar visibilidad de secciones
    const secciones = obtenerElementos('.section');
    secciones.forEach(seccion => {
        if (seccion.id === seccionId) {
            agregarClase(seccion, 'active');
        } else {
            removerClase(seccion, 'active');
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
