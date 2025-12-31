/**
 * @fileoverview Módulo de interpretaciones estadísticas profesionales
 * Genera texto interpretativo basado en resultados estadísticos,
 * siguiendo estándares de publicación científica (APA).
 * 
 * @module logic/interpretations
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { TEXTOS, REFERENCIAS } from '../core/config.js';

/**
 * Genera interpretación textual de las pruebas de normalidad
 * @param {string} var1 - Nombre de la primera variable
 * @param {string} var2 - Nombre de la segunda variable
 * @param {Object} resultado - Resultado del análisis de correlación
 * @returns {string} Texto interpretativo de normalidad
 */
export function generarInterpretacionNormalidad(var1, var2, resultado) {
    const n = resultado.n;
    const norm1 = resultado.normalidad1;
    const norm2 = resultado.normalidad2;
    const prueba = norm1.prueba;
    const razonPrueba = n >= 50 ? 'n ≥ 50' : 'n < 50';
    
    let interpretacion = '';
    
    // Introducción metodológica
    interpretacion += `Se evaluó el supuesto de normalidad mediante ${prueba} (${razonPrueba}) para ${var1} y ${var2}. `;
    
    if (!norm1.normal && !norm2.normal) {
        // Ambas no normales
        interpretacion += `Ambas variables presentaron distribuciones no normales `;
        interpretacion += `(${var1}: D=${norm1.estadistico.toFixed(4)}, p=${norm1.pValor.toFixed(3)}; `;
        interpretacion += `${var2}: D=${norm2.estadistico.toFixed(4)}, p=${norm2.pValor.toFixed(3)}), `;
        interpretacion += `incumpliendo el supuesto para estadística paramétrica. `;
        interpretacion += `Por tanto, se empleó el coeficiente de correlación de Spearman (ρ) como método robusto no paramétrico. `;
        interpretacion += `Según Hernández-Sampieri y Mendoza (2023), cuando los datos no cumplen con el criterio de normalidad, `;
        interpretacion += `los métodos no paramétricos son más apropiados para evitar conclusiones erróneas.`;
    } else if (!norm1.normal || !norm2.normal) {
        // Solo una no normal
        const varNoNormal = !norm1.normal ? var1 : var2;
        const normData = !norm1.normal ? norm1 : norm2;
        const varNormal = norm1.normal ? var1 : var2;
        
        interpretacion += `${varNoNormal} presentó distribución no normal `;
        interpretacion += `(D=${normData.estadistico.toFixed(4)}, p=${normData.pValor.toFixed(3)}), `;
        interpretacion += `mientras que ${varNormal} cumplió con el supuesto de normalidad. `;
        interpretacion += `Dado que al menos una variable no cumple el supuesto de normalidad, `;
        interpretacion += `se optó por el coeficiente de correlación de Spearman (ρ), `;
        interpretacion += `garantizando así la robustez del análisis ante desviaciones de la normalidad (Cohen, 2013).`;
    } else {
        // Ambas normales
        interpretacion += `Ambas variables cumplieron con el supuesto de normalidad `;
        interpretacion += `(${var1}: p=${norm1.pValor.toFixed(3)}; ${var2}: p=${norm2.pValor.toFixed(3)}), `;
        interpretacion += `lo cual justifica el uso de estadística paramétrica mediante el coeficiente de correlación de Pearson (r). `;
        interpretacion += `Este método es óptimo cuando se satisfacen los supuestos de normalidad, `;
        interpretacion += `ofreciendo mayor potencia estadística (Taherdoost, 2022).`;
    }
    
    return interpretacion;
}

/**
 * Genera interpretación textual del análisis de correlación
 * @param {string} var1 - Nombre de la primera variable
 * @param {string} var2 - Nombre de la segunda variable
 * @param {Object} resultado - Resultado del análisis de correlación
 * @returns {string} Texto interpretativo de la correlación
 */
export function generarInterpretacionCorrelacion(var1, var2, resultado) {
    const coef = resultado.coeficiente;
    const pValor = resultado.pValor;
    const n = resultado.n;
    const tipoCoef = resultado.tipoCorrelacion === 'Pearson' ? 'r' : 'ρ';
    const fuerza = resultado.interpretacion.fuerza;
    const direccion = resultado.interpretacion.direccion;
    const coefAbs = Math.abs(coef);
    
    let interpretacion = '';
    
    // Presentación de resultados
    interpretacion += `Se evaluó la correlación entre ${var1} y ${var2} (N=${n}). `;
    
    // Método usado
    if (resultado.tipoCorrelacion === 'Spearman (Rho)') {
        interpretacion += `El sistema detectó que al menos una variable no cumple con la normalidad, `;
        interpretacion += `ejecutando Spearman como corresponde metodológicamente. `;
    } else {
        interpretacion += `Ambas variables cumplieron con el supuesto de normalidad, `;
        interpretacion += `por lo que se aplicó el coeficiente de Pearson. `;
    }
    
    // Interpretación del coeficiente
    if (coefAbs < 0.1) {
        interpretacion += `El coeficiente ${tipoCoef} = ${coef.toFixed(4)} denota una asociación ${direccion} mínima (prácticamente nula), `;
    } else if (coefAbs < 0.3) {
        interpretacion += `El coeficiente ${tipoCoef} = ${coef.toFixed(4)} indica una correlación ${fuerza} de dirección ${direccion}, `;
    } else if (coefAbs < 0.5) {
        interpretacion += `El coeficiente ${tipoCoef} = ${coef.toFixed(4)} revela una asociación ${fuerza} de carácter ${direccion}, `;
    } else if (coefAbs < 0.7) {
        interpretacion += `El coeficiente ${tipoCoef} = ${coef.toFixed(4)} evidencia una correlación ${fuerza} y ${direccion}, `;
    } else {
        interpretacion += `El coeficiente ${tipoCoef} = ${coef.toFixed(4)} demuestra una asociación ${fuerza} muy marcada de tipo ${direccion}, `;
    }
    
    // Interpretación del p-valor
    if (pValor >= 0.05) {
        interpretacion += `y el p-valor = ${pValor.toFixed(4)} (≥ 0.05) confirma que esta relación no es estadísticamente significativa. `;
        interpretacion += `Por tanto, se concluye que no existe evidencia de correlación sistemática entre ${var1} y ${var2} en la población estudiada. `;
        interpretacion += `Este resultado sugiere que las variaciones en una variable no predicen cambios en la otra de manera confiable.`;
    } else if (pValor >= 0.01) {
        interpretacion += `siendo el p-valor = ${pValor.toFixed(4)} (< 0.05) estadísticamente significativo al nivel convencional. `;
        interpretacion += `Esto implica que existe evidencia moderada de una relación sistemática entre ${var1} y ${var2}. `;
        
        if (direccion === 'positiva') {
            interpretacion += `La dirección positiva indica que incrementos en ${var1} tienden a asociarse con incrementos en ${var2}.`;
        } else {
            interpretacion += `La dirección negativa sugiere que incrementos en ${var1} se asocian con decrementos en ${var2}.`;
        }
    } else {
        interpretacion += `con un p-valor = ${pValor.toFixed(4)} (< 0.01) altamente significativo. `;
        interpretacion += `Existe evidencia sólida de una relación estadísticamente significativa entre ${var1} y ${var2}. `;
        
        if (direccion === 'positiva') {
            interpretacion += `La correlación positiva indica que ambas variables varían en la misma dirección: cuando una aumenta, la otra tiende a aumentar proporcionalmente.`;
        } else {
            interpretacion += `La correlación negativa indica una relación inversa: cuando ${var1} aumenta, ${var2} tiende a disminuir de forma sistemática.`;
        }
    }
    
    // Tamaño del efecto
    interpretacion += ` En términos del tamaño del efecto según Cohen (2013), esta correlación se clasifica como ${fuerza}, `;
    
    if (coefAbs < 0.1) {
        interpretacion += `sugiriendo que el vínculo entre las variables tiene escasa relevancia práctica para predicción o intervención.`;
    } else if (coefAbs < 0.3) {
        interpretacion += `lo que implica que aproximadamente ${(coefAbs * coefAbs * 100).toFixed(1)}% de la varianza en ${var2} puede explicarse por ${var1}.`;
    } else if (coefAbs < 0.5) {
        interpretacion += `explicando aproximadamente ${(coefAbs * coefAbs * 100).toFixed(1)}% de la varianza compartida, lo que tiene implicaciones prácticas moderadas.`;
    } else {
        interpretacion += `indicando que ${(coefAbs * coefAbs * 100).toFixed(1)}% de la variabilidad en ${var2} se asocia con ${var1}, lo cual tiene sustancial relevancia práctica.`;
    }
    
    return interpretacion;
}

/**
 * Genera interpretación de la prueba de hipótesis
 * @param {string} var1 - Nombre de la primera variable
 * @param {string} var2 - Nombre de la segunda variable
 * @param {Object} resultado - Resultado del análisis de correlación
 * @param {Object} prueba - Resultado de la prueba de hipótesis
 * @returns {string} Texto interpretativo de la prueba de hipótesis
 */
export function generarInterpretacionHipotesis(var1, var2, resultado, prueba) {
    const coef = resultado.coeficiente;
    const pValor = resultado.pValor;
    const alpha = prueba.alpha;
    const n = resultado.n;
    const tipoCoef = resultado.tipoCorrelacion === 'Pearson' ? 'r' : 'ρ';
    const coefAbs = Math.abs(coef);
    
    let interpretacion = '';
    
    // Marco de la prueba
    interpretacion += `En el marco de la prueba de hipótesis, se planteó H₀: ${tipoCoef} = 0 (no existe correlación) `;
    interpretacion += `versus H₁: ${tipoCoef} ≠ 0 (existe correlación) con un nivel de significancia α = ${alpha}. `;
    
    // Estadístico y decisión
    interpretacion += `Con ${tipoCoef} = ${coef.toFixed(4)} y p = ${pValor.toFixed(4)}, `;
    
    if (prueba.decision === 'rechazar') {
        interpretacion += `la comparación ${pValor.toFixed(4)} < ${alpha} conduce a rechazar H₀. `;
        interpretacion += `Formalmente, se concluye que existe evidencia estadísticamente suficiente para afirmar que la correlación entre ${var1} y ${var2} `;
        interpretacion += `en la población es significativamente diferente de cero. `;
        interpretacion += `Esta decisión, reportada con el estadístico (${tipoCoef} = ${coef.toFixed(4)}), p-valor (p = ${pValor.toFixed(4)}) y comparación (p < α), `;
        interpretacion += `cumple con los estándares de la metodología de la investigación propuestos por Hernández Sampieri y colaboradores. `;
        interpretacion += `Es fundamental destacar que correlación no implica causalidad; este hallazgo indica asociación sistemática, pero no establece dirección causal sin un diseño experimental apropiado.`;
    } else {
        interpretacion += `la comparación ${pValor.toFixed(4)} ≥ ${alpha} conduce a NO rechazar H₀. `;
        interpretacion += `Formalmente, se concluye que no existe evidencia suficiente para afirmar que la correlación entre ${var1} y ${var2} `;
        interpretacion += `en la población sea diferente de cero. `;
        interpretacion += `Esta decisión, reportada con el estadístico (${tipoCoef} = ${coef.toFixed(4)}), p-valor (p = ${pValor.toFixed(4)}) y comparación (p ≥ α), `;
        interpretacion += `cumple con los estándares de la metodología de la investigación propuestos por Hernández Sampieri y colaboradores. `;
        
        if (coefAbs < 0.1) {
            interpretacion += `El coeficiente cercano a cero sugiere ausencia práctica de relación lineal o monotónica entre las variables.`;
        } else {
            interpretacion += `Aunque se observa una tendencia (${tipoCoef} = ${coef.toFixed(4)}), la variabilidad muestral no permite generalizar esta asociación a la población con confianza.`;
        }
    }
    
    // Recomendaciones
    interpretacion += ` Para futuras investigaciones, se recomienda `;
    
    if (n < 30) {
        interpretacion += `aumentar el tamaño muestral (N actual = ${n}), ya que muestras pequeñas tienen menor poder estadístico para detectar efectos reales. `;
    } else if (n < 100) {
        interpretacion += `considerar incrementar el tamaño muestral para mayor precisión en la estimación del parámetro poblacional. `;
    } else if (n < 200) {
        interpretacion += `considerar incrementar más el tamaño muestral para modelos multivariados más complejos. `;
    } else if (n < 500) {
        interpretacion += `el uso de análisis avanzados ya que el tamaño muestral (N = ${n}) proporciona un excelente poder estadístico y estabilidad en las estimaciones. `;
    } else {
        interpretacion += `prestar atención al ejecutar pruebas más complejas, el tamaño muestral (N = ${n}) es muy grande y esto garantiza un poder estadístico óptimo. `;
    }
    
    if (prueba.decision !== 'rechazar' && coefAbs > 0.2) {
        interpretacion += `Dado que el coeficiente observado sugiere una tendencia, un estudio con mayor potencia estadística podría revelar significancia. `;
    }
    
    interpretacion += `Asimismo, se sugiere complementar con análisis de regresión, explorar posibles variables mediadoras o moderadoras, `;
    interpretacion += `y triangular estos hallazgos cuantitativos con métodos cualitativos para una comprensión más holística del problema.`;
    
    return interpretacion;
}

/**
 * Genera marco metodológico completo para la investigación
 * @param {string} var1 - Primera variable
 * @param {string} var2 - Segunda variable
 * @param {string} unidadAnalisis - Unidad de análisis
 * @param {string} lugarContexto - Contexto/lugar
 * @returns {Object} Marco metodológico estructurado
 */
export function generarMarcoMetodologico(var1, var2, unidadAnalisis, lugarContexto) {
    let contexto = '';
    if (unidadAnalisis && lugarContexto) {
        contexto = ` en ${unidadAnalisis} de ${lugarContexto}`;
    }
    
    return {
        preguntaInvestigacion: unidadAnalisis && lugarContexto
            ? `¿Cuál es la relación entre ${var1} y ${var2} en ${unidadAnalisis} de ${lugarContexto}?`
            : `¿Cuál es la relación entre ${var1} y ${var2}?`,
            
        objetivoGeneral: unidadAnalisis && lugarContexto
            ? `Determinar la relación entre ${var1} y ${var2} en ${unidadAnalisis} de ${lugarContexto}.`
            : `Determinar la relación entre ${var1} y ${var2}.`,
            
        objetivosEspecificos: [
            `Establecer el vínculo entre ${var1} y ${var2}${contexto}.`
        ],
        
        hipotesis: {
            hipotesisInvestigador: `Existe una relación estadísticamente significativa entre ${var1} y ${var2}${contexto}.`,
            hipotesisNula: `No existe una relación estadísticamente significativa entre ${var1} y ${var2}${contexto}.`,
            hipotesisAlterna: `Sí existe una relación estadísticamente significativa entre ${var1} y ${var2}${contexto}.`
        }
    };
}

/**
 * Genera plantilla de discusión profesional
 * @param {string} var1 - Primera variable
 * @param {string} var2 - Segunda variable
 * @param {Object} resultado - Resultado de correlación
 * @param {Object} prueba - Resultado de prueba de hipótesis
 * @param {string} unidadAnalisis - Unidad de análisis
 * @param {string} lugarContexto - Contexto/lugar
 * @returns {string} Plantilla de discusión con marcadores
 */
export function generarPlantillaDiscusion(var1, var2, resultado, prueba, unidadAnalisis, lugarContexto) {
    let contexto = '';
    if (unidadAnalisis && lugarContexto) {
        contexto = ` en ${unidadAnalisis} de ${lugarContexto}`;
    }
    
    const marco = generarMarcoMetodologico(var1, var2, unidadAnalisis, lugarContexto);
    let discusion = '';
    
    // Sección 1: Marco
    discusion += `**MARCO DE INVESTIGACIÓN**\n\n`;
    discusion += `**Pregunta de Investigación:**\n${marco.preguntaInvestigacion}\n\n`;
    discusion += `**Objetivo General:**\n${marco.objetivoGeneral}\n\n`;
    discusion += `**Hipótesis de Investigación:**\n${marco.hipotesis.hipotesisInvestigador}\n\n`;
    discusion += `**Hipótesis Nula (H₀):**\n${marco.hipotesis.hipotesisNula}\n\n`;
    
    // Sección 2: Metodología
    discusion += `---\n\n**METODOLOGÍA ESTADÍSTICA**\n\n`;
    discusion += `El análisis correlacional se realizó mediante el coeficiente de ${resultado.tipoCorrelacion}, `;
    discusion += `seleccionado en función de las pruebas de normalidad aplicadas.\n\n`;
    
    // Sección 3: Resultados
    discusion += `---\n\n**RESULTADOS**\n\n`;
    discusion += `El análisis reveló un coeficiente de correlación de `;
    discusion += `${resultado.tipoCorrelacion === 'Pearson' ? 'r' : 'ρ'} = ${resultado.coeficiente.toFixed(4)}, `;
    discusion += `con un valor de significancia p = ${resultado.pValor.toFixed(4)}.\n\n`;
    
    // Sección 4: Discusión
    discusion += `---\n\n**DISCUSIÓN E INTERPRETACIÓN**\n\n`;
    discusion += `Los hallazgos ${prueba.decision === 'rechazar' ? 'confirman' : 'no confirman'} `;
    discusion += `la hipótesis de investigación planteada. `;
    discusion += `Este resultado puede interpretarse en el contexto de [MARCO TEÓRICO]. `;
    discusion += `Según [AUTOR] ([AÑO]), [CONCEPTO TEÓRICO RELACIONADO].\n\n`;
    
    discusion += `**Implicaciones:**\n`;
    discusion += `- [IMPLICACIÓN TEÓRICA]\n`;
    discusion += `- [IMPLICACIÓN PRÁCTICA]\n`;
    discusion += `- [IMPLICACIÓN METODOLÓGICA]\n\n`;
    
    discusion += `**Limitaciones del estudio:**\n`;
    discusion += `- [LIMITACIÓN MUESTRAL/METODOLÓGICA]\n`;
    discusion += `- [LIMITACIÓN DE GENERALIZACIÓN]\n\n`;
    
    discusion += `**Recomendaciones para futuras investigaciones:**\n`;
    discusion += `- [RECOMENDACIÓN 1]\n`;
    discusion += `- [RECOMENDACIÓN 2]\n`;
    
    return discusion;
}

/**
 * Obtiene las referencias bibliográficas para citar
 * @returns {Array} Lista de referencias
 */
export function obtenerReferencias() {
    return REFERENCIAS;
}

export default {
    generarInterpretacionNormalidad,
    generarInterpretacionCorrelacion,
    generarInterpretacionHipotesis,
    generarMarcoMetodologico,
    generarPlantillaDiscusion,
    obtenerReferencias
};
