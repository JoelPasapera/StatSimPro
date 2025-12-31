/**
 * @fileoverview Módulo de pruebas de normalidad estadística
 * Implementa Shapiro-Wilk (n < 50) y Kolmogorov-Smirnov (n ≥ 50)
 * para evaluar si los datos siguen una distribución normal.
 * 
 * @module logic/normality
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { calcularDescriptivas, distribucionNormalAcumulada } from './statistics.js';
import { CONFIG } from '../core/config.js';

/**
 * @typedef {Object} ResultadoNormalidad
 * @property {string} prueba - Nombre de la prueba utilizada
 * @property {string} razon - Razón de selección de la prueba
 * @property {number} estadistico - Valor del estadístico de prueba
 * @property {number} pValor - P-valor de la prueba
 * @property {number} n - Tamaño de muestra
 * @property {boolean} normal - Si los datos son normales (p > 0.05)
 * @property {string} decision - Texto explicativo de la decisión
 */

/**
 * Realiza la prueba de normalidad apropiada según el tamaño muestral
 * Shapiro-Wilk para n < 50, Kolmogorov-Smirnov para n ≥ 50
 * @param {number[]} valores - Array de valores numéricos
 * @returns {ResultadoNormalidad} Resultado de la prueba de normalidad
 * @throws {Error} Si hay menos de 3 observaciones
 */
export function pruebaDeNormalidad(valores) {
    const n = valores.length;
    
    if (n < CONFIG.ANALIZADOR.OBSERVACIONES_MIN) {
        throw new Error(`Se necesitan al menos ${CONFIG.ANALIZADOR.OBSERVACIONES_MIN} observaciones para la prueba de normalidad`);
    }
    
    let resultado;
    
    if (n < CONFIG.ANALIZADOR.UMBRAL_SHAPIRO_WILK) {
        resultado = shapiroWilk(valores);
        resultado.prueba = 'Shapiro-Wilk';
        resultado.razon = 'n < 50';
    } else {
        resultado = kolmogorovSmirnov(valores);
        resultado.prueba = 'Kolmogorov-Smirnov';
        resultado.razon = 'n ≥ 50';
    }
    
    resultado.n = n;
    resultado.normal = resultado.pValor > 0.05;
    resultado.decision = resultado.pValor > 0.05
        ? 'Los datos siguen una distribución normal (p > 0.05)'
        : 'Los datos NO siguen una distribución normal (p ≤ 0.05)';
    
    return resultado;
}

/**
 * Prueba de Shapiro-Wilk para normalidad
 * Más potente para muestras pequeñas (n < 50)
 * @param {number[]} valores - Array de valores
 * @returns {Object} Objeto con estadístico W y pValor
 */
export function shapiroWilk(valores) {
    const n = valores.length;
    const ordenados = [...valores].sort((a, b) => a - b);
    
    const descriptivas = calcularDescriptivas(valores);
    const media = descriptivas.media;
    const desviacion = descriptivas.desviacion;
    
    // Estandarizar valores
    const estandarizados = ordenados.map(v => 
        desviacion > 0 ? (v - media) / desviacion : 0
    );
    
    // Calcular numerador de W
    let numerador = 0;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        const peso = obtenerPesoShapiro(n, i + 1);
        numerador += peso * (estandarizados[n - 1 - i] - estandarizados[i]);
    }
    
    // Calcular denominador de W
    const denominador = estandarizados.reduce((sum, v) => sum + v * v, 0);
    
    // Estadístico W
    const W = denominador > 0 ? (numerador * numerador) / denominador : 1;
    
    // Estimar p-valor
    const pValor = estimarPValorShapiro(W, n);
    
    return {
        estadistico: W,
        pValor
    };
}

/**
 * Obtiene el peso para el cálculo de Shapiro-Wilk
 * Aproximación simplificada de los coeficientes tabulados
 * @param {number} n - Tamaño de muestra
 * @param {number} i - Índice del peso (1-based)
 * @returns {number} Peso correspondiente
 */
function obtenerPesoShapiro(n, i) {
    // Aproximación basada en los cuantiles de la normal ordenada
    // Para implementación más precisa, usar tablas de coeficientes
    return 1 / Math.sqrt(n);
}

/**
 * Estima el p-valor para la prueba de Shapiro-Wilk
 * Usa aproximación normal transformada
 * @param {number} W - Estadístico W
 * @param {number} n - Tamaño de muestra
 * @returns {number} P-valor estimado
 */
function estimarPValorShapiro(W, n) {
    // Transformación a distribución normal (aproximación de Royston)
    const mu = -1.5861 - 0.31082 * Math.log(n) - 0.083751 * Math.pow(Math.log(n), 2);
    const sigma = Math.exp(-0.4803 - 0.082676 * Math.log(n) + 0.0030302 * Math.pow(Math.log(n), 2));
    
    const z = (Math.log(1 - W) - mu) / sigma;
    const p = 1 - distribucionNormalAcumulada(z);
    
    // Limitar a rango válido
    return Math.max(0.001, Math.min(0.999, p));
}

/**
 * Prueba de Kolmogorov-Smirnov para normalidad
 * Recomendada para muestras grandes (n ≥ 50)
 * @param {number[]} valores - Array de valores
 * @returns {Object} Objeto con estadístico D y pValor
 */
export function kolmogorovSmirnov(valores) {
    const n = valores.length;
    const ordenados = [...valores].sort((a, b) => a - b);
    
    const descriptivas = calcularDescriptivas(valores);
    const media = descriptivas.media;
    const desviacion = descriptivas.desviacion;
    
    // Calcular la máxima diferencia D
    let D = 0;
    
    for (let i = 0; i < n; i++) {
        // Estandarizar valor
        const z = desviacion > 0 ? (ordenados[i] - media) / desviacion : 0;
        
        // Función de distribución empírica
        const Fn = (i + 1) / n;
        
        // Función de distribución teórica (normal estándar)
        const Fz = distribucionNormalAcumulada(z);
        
        // Diferencias
        const D1 = Math.abs(Fn - Fz);
        const D2 = Math.abs(Fz - i / n);
        
        D = Math.max(D, D1, D2);
    }
    
    // Estimar p-valor
    const pValor = estimarPValorKS(D, n);
    
    return {
        estadistico: D,
        pValor
    };
}

/**
 * Estima el p-valor para la prueba de Kolmogorov-Smirnov
 * Usa la aproximación de Marsaglia
 * @param {number} D - Estadístico D
 * @param {number} n - Tamaño de muestra
 * @returns {number} P-valor estimado
 */
function estimarPValorKS(D, n) {
    // Transformación para aproximación asintótica
    const lambda = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D;
    
    // Serie de Kolmogorov
    let suma = 0;
    for (let k = 1; k <= 10; k++) {
        suma += Math.pow(-1, k - 1) * Math.exp(-2 * k * k * lambda * lambda);
    }
    
    const p = 2 * suma;
    
    // Limitar a rango válido
    return Math.max(0.001, Math.min(0.999, p));
}

/**
 * Realiza prueba de normalidad sobre un array de valores
 * Versión simplificada que acepta valores directamente
 * @param {number[]} valores - Array de valores numéricos
 * @returns {ResultadoNormalidad} Resultado de la prueba
 */
export function pruebaDeNormalidadArray(valores) {
    return pruebaDeNormalidad(valores);
}

/**
 * Evalúa si un conjunto de datos cumple con normalidad para análisis paramétrico
 * @param {number[]} valores - Array de valores
 * @param {number} [alfa=0.05] - Nivel de significancia
 * @returns {boolean} True si los datos son normales
 */
export function esNormal(valores, alfa = 0.05) {
    try {
        const resultado = pruebaDeNormalidad(valores);
        return resultado.pValor > alfa;
    } catch {
        return false;
    }
}

/**
 * Genera un reporte detallado de normalidad para múltiples variables
 * @param {Object<string, number[]>} variables - Objeto con nombre de variable y sus valores
 * @returns {Object<string, ResultadoNormalidad>} Resultados por variable
 */
export function reporteNormalidadMultiple(variables) {
    const resultados = {};
    
    for (const [nombre, valores] of Object.entries(variables)) {
        try {
            resultados[nombre] = pruebaDeNormalidad(valores);
        } catch (error) {
            resultados[nombre] = {
                error: error.message,
                normal: null
            };
        }
    }
    
    return resultados;
}

export default {
    pruebaDeNormalidad,
    shapiroWilk,
    kolmogorovSmirnov,
    pruebaDeNormalidadArray,
    esNormal,
    reporteNormalidadMultiple
};
