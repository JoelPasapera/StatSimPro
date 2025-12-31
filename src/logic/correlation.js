/**
 * @fileoverview Módulo de análisis de correlación
 * Implementa correlación de Pearson (paramétrica) y Spearman (no paramétrica)
 * con selección automática basada en pruebas de normalidad.
 * 
 * @module logic/correlation
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { 
    calcularDescriptivas, 
    convertirARangos, 
    distribucionNormalAcumulada,
    calcularPValorT
} from './statistics.js';
import { pruebaDeNormalidad } from './normality.js';
import { UMBRALES_CORRELACION, TEXTOS } from '../core/config.js';

/**
 * @typedef {Object} InterpretacionCorrelacion
 * @property {string} fuerza - Clasificación de la fuerza (débil, moderada, fuerte)
 * @property {string} direccion - Dirección (positiva o negativa)
 * @property {string} significancia - Clasificación de significancia
 * @property {string} texto - Texto descriptivo completo
 */

/**
 * @typedef {Object} ResultadoCorrelacion
 * @property {number} coeficiente - Valor del coeficiente de correlación
 * @property {number} pValor - P-valor de la prueba
 * @property {number} n - Tamaño de muestra
 * @property {string} tipoCorrelacion - 'Pearson' o 'Spearman (Rho)'
 * @property {string} tipoPrueba - 'bilateral' o 'unilateral'
 * @property {Object} normalidad1 - Resultado de normalidad variable 1
 * @property {Object} normalidad2 - Resultado de normalidad variable 2
 * @property {InterpretacionCorrelacion} interpretacion - Interpretación del resultado
 */

/**
 * Calcula la correlación entre dos variables con selección automática del método
 * Usa Pearson si ambas variables son normales, Spearman en caso contrario
 * @param {number[]} valores1 - Valores de la primera variable
 * @param {number[]} valores2 - Valores de la segunda variable
 * @param {string} [tipoPrueba='bilateral'] - Tipo de prueba estadística
 * @returns {ResultadoCorrelacion} Resultado completo del análisis de correlación
 * @throws {Error} Si las variables tienen diferente longitud o insuficientes datos
 */
export function calcularCorrelacion(valores1, valores2, tipoPrueba = 'bilateral') {
    // Validaciones
    if (valores1.length !== valores2.length) {
        throw new Error('Las columnas deben tener el mismo número de valores');
    }
    
    if (valores1.length < 3) {
        throw new Error('Se necesitan al menos 3 pares de valores');
    }
    
    // Pruebas de normalidad
    const normalidad1 = pruebaDeNormalidad(valores1);
    const normalidad2 = pruebaDeNormalidad(valores2);
    
    let resultado;
    
    // Selección automática del método
    if (normalidad1.normal && normalidad2.normal) {
        resultado = correlacionPearson(valores1, valores2, tipoPrueba);
        resultado.tipoCorrelacion = 'Pearson';
    } else {
        resultado = correlacionSpearman(valores1, valores2, tipoPrueba);
        resultado.tipoCorrelacion = 'Spearman (Rho)';
    }
    
    // Agregar metadatos
    resultado.normalidad1 = normalidad1;
    resultado.normalidad2 = normalidad2;
    resultado.tipoPrueba = tipoPrueba;
    resultado.interpretacion = interpretarCorrelacion(resultado.coeficiente, resultado.pValor);
    
    return resultado;
}

/**
 * Calcula el coeficiente de correlación de Pearson
 * Apropiado cuando ambas variables siguen distribución normal
 * @param {number[]} valores1 - Primera variable
 * @param {number[]} valores2 - Segunda variable
 * @param {string} tipoPrueba - 'bilateral' o 'unilateral'
 * @returns {Object} Coeficiente r, p-valor y n
 */
export function correlacionPearson(valores1, valores2, tipoPrueba) {
    const n = valores1.length;
    
    const desc1 = calcularDescriptivas(valores1);
    const desc2 = calcularDescriptivas(valores2);
    
    // Calcular covarianza
    let covarianza = 0;
    for (let i = 0; i < n; i++) {
        covarianza += (valores1[i] - desc1.media) * (valores2[i] - desc2.media);
    }
    covarianza /= (n - 1);
    
    // Coeficiente de Pearson
    const r = (desc1.desviacion > 0 && desc2.desviacion > 0)
        ? covarianza / (desc1.desviacion * desc2.desviacion)
        : 0;
    
    // P-valor
    const pValor = calcularPValorPearson(r, n, tipoPrueba);
    
    return {
        coeficiente: r,
        pValor,
        n
    };
}

/**
 * Calcula el coeficiente de correlación de Spearman (Rho)
 * No paramétrico, basado en rangos
 * @param {number[]} valores1 - Primera variable
 * @param {number[]} valores2 - Segunda variable
 * @param {string} tipoPrueba - 'bilateral' o 'unilateral'
 * @returns {Object} Coeficiente rho, p-valor y n
 */
export function correlacionSpearman(valores1, valores2, tipoPrueba) {
    const n = valores1.length;
    
    // Convertir a rangos
    const rangos1 = convertirARangos(valores1);
    const rangos2 = convertirARangos(valores2);
    
    // Aplicar Pearson a los rangos
    const resultadoPearson = correlacionPearson(rangos1, rangos2, tipoPrueba);
    
    // Recalcular p-valor específico para Spearman
    const pValor = calcularPValorSpearman(resultadoPearson.coeficiente, n, tipoPrueba);
    
    return {
        coeficiente: resultadoPearson.coeficiente,
        pValor,
        n
    };
}

/**
 * Calcula el p-valor para el coeficiente de Pearson
 * Usa la distribución t de Student
 * @param {number} r - Coeficiente de correlación
 * @param {number} n - Tamaño de muestra
 * @param {string} tipoPrueba - 'bilateral' o 'unilateral'
 * @returns {number} P-valor
 */
function calcularPValorPearson(r, n, tipoPrueba) {
    // Evitar división por cero
    if (Math.abs(r) >= 1) {
        return r === 0 ? 1 : 0;
    }
    
    // Estadístico t
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const gl = n - 2;
    
    // P-valor de una cola
    let pValor = calcularPValorT(Math.abs(t), gl);
    
    // Ajustar para prueba bilateral
    if (tipoPrueba === 'bilateral') {
        pValor = pValor * 2;
    }
    
    return Math.min(1, pValor);
}

/**
 * Calcula el p-valor para el coeficiente de Spearman
 * Usa aproximación normal para n > 10
 * @param {number} rho - Coeficiente de correlación
 * @param {number} n - Tamaño de muestra
 * @param {string} tipoPrueba - 'bilateral' o 'unilateral'
 * @returns {number} P-valor
 */
function calcularPValorSpearman(rho, n, tipoPrueba) {
    if (n > 10) {
        // Aproximación normal para muestras grandes
        const z = rho * Math.sqrt(n - 1);
        let pValor = 1 - distribucionNormalAcumulada(Math.abs(z));
        
        if (tipoPrueba === 'bilateral') {
            pValor = pValor * 2;
        }
        
        return Math.min(1, pValor);
    } else {
        // Para muestras pequeñas, usar aproximación t
        return calcularPValorPearson(rho, n, tipoPrueba);
    }
}

/**
 * Interpreta el coeficiente de correlación y su p-valor
 * Siguiendo criterios de Cohen (2013) para tamaño del efecto
 * @param {number} r - Coeficiente de correlación
 * @param {number} p - P-valor
 * @returns {InterpretacionCorrelacion} Interpretación completa
 */
export function interpretarCorrelacion(r, p) {
    // Dirección
    const direccion = r >= 0 ? TEXTOS.DIRECCION_POSITIVA : TEXTOS.DIRECCION_NEGATIVA;
    
    // Fuerza según umbrales de Cohen
    const absR = Math.abs(r);
    let fuerza;
    
    if (absR < UMBRALES_CORRELACION.NULA) {
        fuerza = TEXTOS.CORRELACION_NULA;
    } else if (absR < UMBRALES_CORRELACION.DEBIL) {
        fuerza = TEXTOS.CORRELACION_DEBIL;
    } else if (absR < UMBRALES_CORRELACION.MODERADA) {
        fuerza = TEXTOS.CORRELACION_MODERADA;
    } else if (absR < UMBRALES_CORRELACION.FUERTE) {
        fuerza = 'moderada-fuerte';
    } else if (absR < UMBRALES_CORRELACION.MUY_FUERTE) {
        fuerza = TEXTOS.CORRELACION_FUERTE;
    } else {
        fuerza = TEXTOS.CORRELACION_MUY_FUERTE;
    }
    
    // Significancia estadística
    let significancia;
    if (p < 0.001) {
        significancia = TEXTOS.SIGNIFICANCIA_ALTA;
    } else if (p < 0.01) {
        significancia = TEXTOS.SIGNIFICANCIA_MUY;
    } else if (p < 0.05) {
        significancia = TEXTOS.SIGNIFICANCIA_SI;
    } else {
        significancia = TEXTOS.SIGNIFICANCIA_NO;
    }
    
    return {
        fuerza,
        direccion,
        significancia,
        texto: `Correlación ${fuerza} ${direccion} ${significancia}`
    };
}

/**
 * Realiza la prueba de hipótesis para la correlación
 * @param {ResultadoCorrelacion} resultadoCorrelacion - Resultado del análisis de correlación
 * @param {number} [alpha=0.05] - Nivel de significancia
 * @returns {Object} Resultado de la prueba de hipótesis
 */
export function pruebaHipotesisCorrelacion(resultadoCorrelacion, alpha = 0.05) {
    const decision = resultadoCorrelacion.pValor < alpha ? 'rechazar' : 'no_rechazar';
    
    return {
        alpha,
        pValor: resultadoCorrelacion.pValor,
        decision,
        conclusionH0: decision === 'rechazar'
            ? `Se rechaza la hipótesis nula (p = ${resultadoCorrelacion.pValor.toFixed(4)} < α = ${alpha})`
            : `No se rechaza la hipótesis nula (p = ${resultadoCorrelacion.pValor.toFixed(4)} ≥ α = ${alpha})`,
        conclusionH1: decision === 'rechazar'
            ? `Existe una relación estadísticamente significativa ${resultadoCorrelacion.interpretacion.direccion}`
            : 'No existe evidencia suficiente de una relación estadísticamente significativa'
    };
}

/**
 * Calcula correlaciones entre dimensiones de dos variables
 * @param {Object<string, number[]>} dimensiones1 - Dimensiones de variable 1
 * @param {Object<string, number[]>} dimensiones2 - Dimensiones de variable 2
 * @param {string} [tipoPrueba='bilateral'] - Tipo de prueba
 * @returns {Array<Object>} Array de resultados de correlación por dimensiones
 */
export function correlacionPorDimensiones(dimensiones1, dimensiones2, tipoPrueba = 'bilateral') {
    const resultados = [];
    
    for (const [nombreDim1, valores1] of Object.entries(dimensiones1)) {
        for (const [nombreDim2, valores2] of Object.entries(dimensiones2)) {
            try {
                const resultado = calcularCorrelacion(valores1, valores2, tipoPrueba);
                resultados.push({
                    dimension1: nombreDim1,
                    dimension2: nombreDim2,
                    ...resultado
                });
            } catch (error) {
                resultados.push({
                    dimension1: nombreDim1,
                    dimension2: nombreDim2,
                    error: error.message
                });
            }
        }
    }
    
    return resultados;
}

/**
 * Genera una matriz de correlaciones para múltiples variables
 * @param {Object<string, number[]>} variables - Objeto con variables y sus valores
 * @param {string} [tipoPrueba='bilateral'] - Tipo de prueba
 * @returns {Object} Matriz de correlaciones con resultados
 */
export function matrizCorrelaciones(variables, tipoPrueba = 'bilateral') {
    const nombres = Object.keys(variables);
    const matriz = {};
    
    for (const nombre1 of nombres) {
        matriz[nombre1] = {};
        for (const nombre2 of nombres) {
            if (nombre1 === nombre2) {
                matriz[nombre1][nombre2] = { coeficiente: 1, pValor: 0 };
            } else if (matriz[nombre2] && matriz[nombre2][nombre1]) {
                // Copiar resultado simétrico
                matriz[nombre1][nombre2] = matriz[nombre2][nombre1];
            } else {
                try {
                    matriz[nombre1][nombre2] = calcularCorrelacion(
                        variables[nombre1],
                        variables[nombre2],
                        tipoPrueba
                    );
                } catch (error) {
                    matriz[nombre1][nombre2] = { error: error.message };
                }
            }
        }
    }
    
    return matriz;
}

export default {
    calcularCorrelacion,
    correlacionPearson,
    correlacionSpearman,
    interpretarCorrelacion,
    pruebaHipotesisCorrelacion,
    correlacionPorDimensiones,
    matrizCorrelaciones
};
