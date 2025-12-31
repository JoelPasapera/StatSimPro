/**
 * @fileoverview Módulo de Gráficos Estadísticos
 * Genera visualizaciones para análisis de datos usando Canvas API.
 * Implementación ligera sin dependencias externas.
 * 
 * @module ui/charts
 * @author Joel Pasapera - Arquitectura empresarial
 */

import { formatearNumero } from '../utils/helpers.js';

/**
 * @typedef {Object} PuntoDispersion
 * @property {number} x - Coordenada X
 * @property {number} y - Coordenada Y
 */

/**
 * @typedef {Object} ConfigGrafico
 * @property {string} titulo - Título del gráfico
 * @property {string} etiquetaX - Etiqueta eje X
 * @property {string} etiquetaY - Etiqueta eje Y
 * @property {string} [colorPuntos='#3b82f6'] - Color de los puntos
 * @property {string} [colorLinea='#ef4444'] - Color de la línea de tendencia
 * @property {boolean} [mostrarLinea=true] - Si mostrar línea de tendencia
 */

/**
 * Colores del tema para gráficos
 */
const COLORES = {
    primario: '#3b82f6',
    secundario: '#f59e0b',
    exito: '#22c55e',
    error: '#ef4444',
    gris: {
        50: '#f8fafc',
        200: '#e2e8f0',
        400: '#94a3b8',
        600: '#475569',
        800: '#1e293b'
    }
};

/**
 * Configuración por defecto de los gráficos
 */
const CONFIG_DEFAULT = {
    padding: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 70
    },
    fuente: {
        familia: "'Inter', sans-serif",
        tamanoTitulo: 16,
        tamanoEtiqueta: 12,
        tamanoEje: 11
    },
    puntos: {
        radio: 6,
        radioHover: 8
    },
    linea: {
        grosor: 2
    },
    grid: {
        color: '#e2e8f0',
        grosor: 1
    }
};

/**
 * Crea un gráfico de dispersión con línea de tendencia opcional
 * @param {string|HTMLCanvasElement} canvasId - ID del canvas o elemento
 * @param {number[]} datosX - Datos del eje X
 * @param {number[]} datosY - Datos del eje Y
 * @param {ConfigGrafico} config - Configuración del gráfico
 * @returns {Object} API del gráfico para actualizar/destruir
 */
export function crearGraficoDispersion(canvasId, datosX, datosY, config = {}) {
    const canvas = typeof canvasId === 'string' 
        ? document.getElementById(canvasId) 
        : canvasId;
    
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error('Canvas no encontrado:', canvasId);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Configurar dimensiones responsivas
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = Math.min(rect.width * 0.6, 500) * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = Math.min(rect.width * 0.6, 500) + 'px';
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = Math.min(rect.width * 0.6, 500);
    
    // Merge configuración
    const opciones = {
        titulo: config.titulo || 'Gráfico de Dispersión',
        etiquetaX: config.etiquetaX || 'Variable X',
        etiquetaY: config.etiquetaY || 'Variable Y',
        colorPuntos: config.colorPuntos || COLORES.primario,
        colorLinea: config.colorLinea || COLORES.error,
        mostrarLinea: config.mostrarLinea !== false
    };
    
    // Calcular rangos
    const minX = Math.min(...datosX);
    const maxX = Math.max(...datosX);
    const minY = Math.min(...datosY);
    const maxY = Math.max(...datosY);
    
    // Agregar margen al rango
    const rangoX = maxX - minX || 1;
    const rangoY = maxY - minY || 1;
    const margenX = rangoX * 0.1;
    const margenY = rangoY * 0.1;
    
    const escalas = {
        x: {
            min: minX - margenX,
            max: maxX + margenX,
            rango: rangoX + margenX * 2
        },
        y: {
            min: minY - margenY,
            max: maxY + margenY,
            rango: rangoY + margenY * 2
        }
    };
    
    // Área de dibujo
    const area = {
        x: CONFIG_DEFAULT.padding.left,
        y: CONFIG_DEFAULT.padding.top,
        width: width - CONFIG_DEFAULT.padding.left - CONFIG_DEFAULT.padding.right,
        height: height - CONFIG_DEFAULT.padding.top - CONFIG_DEFAULT.padding.bottom
    };
    
    /**
     * Convierte valor de datos a coordenada X del canvas
     */
    function toCanvasX(valor) {
        return area.x + ((valor - escalas.x.min) / escalas.x.rango) * area.width;
    }
    
    /**
     * Convierte valor de datos a coordenada Y del canvas
     */
    function toCanvasY(valor) {
        return area.y + area.height - ((valor - escalas.y.min) / escalas.y.rango) * area.height;
    }
    
    /**
     * Dibuja el grid de fondo
     */
    function dibujarGrid() {
        ctx.strokeStyle = CONFIG_DEFAULT.grid.color;
        ctx.lineWidth = CONFIG_DEFAULT.grid.grosor;
        ctx.setLineDash([4, 4]);
        
        // Líneas horizontales
        const numLineasY = 5;
        for (let i = 0; i <= numLineasY; i++) {
            const y = area.y + (area.height / numLineasY) * i;
            ctx.beginPath();
            ctx.moveTo(area.x, y);
            ctx.lineTo(area.x + area.width, y);
            ctx.stroke();
        }
        
        // Líneas verticales
        const numLineasX = 5;
        for (let i = 0; i <= numLineasX; i++) {
            const x = area.x + (area.width / numLineasX) * i;
            ctx.beginPath();
            ctx.moveTo(x, area.y);
            ctx.lineTo(x, area.y + area.height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    /**
     * Dibuja los ejes X e Y
     */
    function dibujarEjes() {
        ctx.strokeStyle = COLORES.gris[800];
        ctx.lineWidth = 2;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(area.x, area.y + area.height);
        ctx.lineTo(area.x + area.width, area.y + area.height);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(area.x, area.y);
        ctx.lineTo(area.x, area.y + area.height);
        ctx.stroke();
        
        // Etiquetas de ejes
        ctx.fillStyle = COLORES.gris[600];
        ctx.font = `${CONFIG_DEFAULT.fuente.tamanoEje}px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'center';
        
        // Valores eje X
        const numValoresX = 5;
        for (let i = 0; i <= numValoresX; i++) {
            const valor = escalas.x.min + (escalas.x.rango / numValoresX) * i;
            const x = toCanvasX(valor);
            ctx.fillText(formatearNumero(valor, 1), x, area.y + area.height + 20);
        }
        
        // Valores eje Y
        ctx.textAlign = 'right';
        const numValoresY = 5;
        for (let i = 0; i <= numValoresY; i++) {
            const valor = escalas.y.min + (escalas.y.rango / numValoresY) * i;
            const y = toCanvasY(valor);
            ctx.fillText(formatearNumero(valor, 1), area.x - 10, y + 4);
        }
    }
    
    /**
     * Dibuja las etiquetas de los ejes
     */
    function dibujarEtiquetas() {
        ctx.fillStyle = COLORES.gris[800];
        ctx.font = `600 ${CONFIG_DEFAULT.fuente.tamanoEtiqueta}px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'center';
        
        // Etiqueta eje X
        ctx.fillText(opciones.etiquetaX, area.x + area.width / 2, height - 10);
        
        // Etiqueta eje Y (rotada)
        ctx.save();
        ctx.translate(15, area.y + area.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(opciones.etiquetaY, 0, 0);
        ctx.restore();
    }
    
    /**
     * Dibuja el título del gráfico
     */
    function dibujarTitulo() {
        ctx.fillStyle = COLORES.gris[800];
        ctx.font = `700 ${CONFIG_DEFAULT.fuente.tamanoTitulo}px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'center';
        ctx.fillText(opciones.titulo, width / 2, 25);
    }
    
    /**
     * Dibuja los puntos de dispersión
     */
    function dibujarPuntos() {
        ctx.fillStyle = opciones.colorPuntos;
        
        for (let i = 0; i < datosX.length; i++) {
            const x = toCanvasX(datosX[i]);
            const y = toCanvasY(datosY[i]);
            
            // Sombra
            ctx.beginPath();
            ctx.arc(x, y, CONFIG_DEFAULT.puntos.radio + 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fill();
            
            // Punto
            ctx.beginPath();
            ctx.arc(x, y, CONFIG_DEFAULT.puntos.radio, 0, Math.PI * 2);
            ctx.fillStyle = opciones.colorPuntos;
            ctx.fill();
            
            // Borde blanco
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    /**
     * Calcula y dibuja la línea de tendencia (regresión lineal)
     */
    function dibujarLineaTendencia() {
        if (!opciones.mostrarLinea || datosX.length < 2) return;
        
        // Calcular regresión lineal
        const n = datosX.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += datosX[i];
            sumY += datosY[i];
            sumXY += datosX[i] * datosY[i];
            sumX2 += datosX[i] * datosX[i];
        }
        
        const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercepto = (sumY - pendiente * sumX) / n;
        
        // Puntos de la línea
        const x1 = escalas.x.min;
        const y1 = pendiente * x1 + intercepto;
        const x2 = escalas.x.max;
        const y2 = pendiente * x2 + intercepto;
        
        // Dibujar línea
        ctx.strokeStyle = opciones.colorLinea;
        ctx.lineWidth = CONFIG_DEFAULT.linea.grosor;
        ctx.setLineDash([8, 4]);
        
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Etiqueta de la ecuación
        const ecuacion = `y = ${formatearNumero(pendiente, 3)}x ${intercepto >= 0 ? '+' : ''} ${formatearNumero(intercepto, 3)}`;
        
        ctx.fillStyle = opciones.colorLinea;
        ctx.font = `500 11px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'right';
        ctx.fillText(ecuacion, area.x + area.width - 10, area.y + 20);
    }
    
    /**
     * Renderiza el gráfico completo
     */
    function render() {
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Fondo
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Componentes
        dibujarGrid();
        dibujarEjes();
        dibujarEtiquetas();
        dibujarTitulo();
        dibujarLineaTendencia();
        dibujarPuntos();
    }
    
    // Renderizar
    render();
    
    // API pública
    return {
        render,
        destroy: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        actualizar: (nuevosX, nuevosY) => {
            datosX = nuevosX;
            datosY = nuevosY;
            render();
        }
    };
}

/**
 * Crea un histograma para visualizar distribución de datos
 * @param {string|HTMLCanvasElement} canvasId - ID del canvas o elemento
 * @param {number[]} datos - Datos a graficar
 * @param {Object} config - Configuración
 * @returns {Object} API del gráfico
 */
export function crearHistograma(canvasId, datos, config = {}) {
    const canvas = typeof canvasId === 'string' 
        ? document.getElementById(canvasId) 
        : canvasId;
    
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    // Configurar dimensiones
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '300px';
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 300;
    
    const opciones = {
        titulo: config.titulo || 'Histograma',
        etiquetaX: config.etiquetaX || 'Valor',
        etiquetaY: config.etiquetaY || 'Frecuencia',
        numBins: config.numBins || 10,
        color: config.color || COLORES.primario
    };
    
    // Calcular bins
    const min = Math.min(...datos);
    const max = Math.max(...datos);
    const rango = max - min || 1;
    const anchoBin = rango / opciones.numBins;
    
    const bins = new Array(opciones.numBins).fill(0);
    
    datos.forEach(valor => {
        let binIndex = Math.floor((valor - min) / anchoBin);
        if (binIndex >= opciones.numBins) binIndex = opciones.numBins - 1;
        bins[binIndex]++;
    });
    
    const maxFrecuencia = Math.max(...bins);
    
    // Área de dibujo
    const padding = CONFIG_DEFAULT.padding;
    const area = {
        x: padding.left,
        y: padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom
    };
    
    function render() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Barras
        const anchoBarra = area.width / opciones.numBins;
        
        bins.forEach((frecuencia, i) => {
            const x = area.x + i * anchoBarra;
            const alturaBarra = (frecuencia / maxFrecuencia) * area.height;
            const y = area.y + area.height - alturaBarra;
            
            // Gradiente
            const gradiente = ctx.createLinearGradient(x, y, x, y + alturaBarra);
            gradiente.addColorStop(0, opciones.color);
            gradiente.addColorStop(1, COLORES.primario + '80');
            
            ctx.fillStyle = gradiente;
            ctx.fillRect(x + 2, y, anchoBarra - 4, alturaBarra);
            
            // Borde
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y, anchoBarra - 4, alturaBarra);
        });
        
        // Ejes
        ctx.strokeStyle = COLORES.gris[800];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(area.x, area.y + area.height);
        ctx.lineTo(area.x + area.width, area.y + area.height);
        ctx.moveTo(area.x, area.y);
        ctx.lineTo(area.x, area.y + area.height);
        ctx.stroke();
        
        // Título
        ctx.fillStyle = COLORES.gris[800];
        ctx.font = `700 ${CONFIG_DEFAULT.fuente.tamanoTitulo}px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'center';
        ctx.fillText(opciones.titulo, width / 2, 25);
    }
    
    render();
    
    return {
        render,
        destroy: () => ctx.clearRect(0, 0, canvas.width, canvas.height)
    };
}

/**
 * Crea un gráfico de barras para comparar categorías
 * @param {string|HTMLCanvasElement} canvasId - ID del canvas
 * @param {string[]} etiquetas - Etiquetas de categorías
 * @param {number[]} valores - Valores de cada categoría
 * @param {Object} config - Configuración
 * @returns {Object} API del gráfico
 */
export function crearGraficoBarras(canvasId, etiquetas, valores, config = {}) {
    const canvas = typeof canvasId === 'string' 
        ? document.getElementById(canvasId) 
        : canvasId;
    
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = 350 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '350px';
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 350;
    
    const opciones = {
        titulo: config.titulo || 'Gráfico de Barras',
        colores: config.colores || [
            COLORES.primario,
            COLORES.secundario,
            COLORES.exito,
            COLORES.error,
            '#8b5cf6',
            '#06b6d4'
        ]
    };
    
    const padding = CONFIG_DEFAULT.padding;
    const area = {
        x: padding.left,
        y: padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom
    };
    
    const maxValor = Math.max(...valores);
    
    function render() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        const anchoBarra = area.width / etiquetas.length;
        const margenBarra = anchoBarra * 0.2;
        
        // Barras
        etiquetas.forEach((etiqueta, i) => {
            const x = area.x + i * anchoBarra + margenBarra / 2;
            const alturaBarra = (valores[i] / maxValor) * area.height;
            const y = area.y + area.height - alturaBarra;
            
            // Barra con gradiente
            const gradiente = ctx.createLinearGradient(x, y, x, y + alturaBarra);
            const color = opciones.colores[i % opciones.colores.length];
            gradiente.addColorStop(0, color);
            gradiente.addColorStop(1, color + '99');
            
            ctx.fillStyle = gradiente;
            ctx.beginPath();
            ctx.roundRect(x, y, anchoBarra - margenBarra, alturaBarra, [4, 4, 0, 0]);
            ctx.fill();
            
            // Valor sobre la barra
            ctx.fillStyle = COLORES.gris[700];
            ctx.font = `600 12px ${CONFIG_DEFAULT.fuente.familia}`;
            ctx.textAlign = 'center';
            ctx.fillText(formatearNumero(valores[i], 2), x + (anchoBarra - margenBarra) / 2, y - 8);
            
            // Etiqueta debajo
            ctx.fillStyle = COLORES.gris[600];
            ctx.font = `11px ${CONFIG_DEFAULT.fuente.familia}`;
            ctx.fillText(
                etiqueta.length > 12 ? etiqueta.substring(0, 12) + '...' : etiqueta,
                x + (anchoBarra - margenBarra) / 2,
                area.y + area.height + 20
            );
        });
        
        // Ejes
        ctx.strokeStyle = COLORES.gris[300];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(area.x, area.y + area.height);
        ctx.lineTo(area.x + area.width, area.y + area.height);
        ctx.stroke();
        
        // Título
        ctx.fillStyle = COLORES.gris[800];
        ctx.font = `700 ${CONFIG_DEFAULT.fuente.tamanoTitulo}px ${CONFIG_DEFAULT.fuente.familia}`;
        ctx.textAlign = 'center';
        ctx.fillText(opciones.titulo, width / 2, 25);
    }
    
    render();
    
    return {
        render,
        destroy: () => ctx.clearRect(0, 0, canvas.width, canvas.height)
    };
}

/**
 * Utilidad para limpiar todos los gráficos de un contenedor
 * @param {string} containerId - ID del contenedor
 */
export function limpiarGraficos(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const canvases = container.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

export default {
    crearGraficoDispersion,
    crearHistograma,
    crearGraficoBarras,
    limpiarGraficos
};
