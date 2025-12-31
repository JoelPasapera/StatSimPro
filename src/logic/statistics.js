/**
 * @fileoverview Módulo de cálculos estadísticos puros
 * Contiene funciones matemáticas puras sin efectos secundarios ni dependencia del DOM.
 * Este módulo implementa los cálculos fundamentales para estadística descriptiva.
 * 
 * @module logic/statistics
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

/**
 * @typedef {Object} EstadisticasDescriptivas
 * @property {number} n - Tamaño de muestra
 * @property {number} media - Media aritmética
 * @property {number} desviacion - Desviación estándar
 * @property {number} varianza - Varianza
 * @property {number} errorEstandar - Error estándar de la media
 * @property {number} min - Valor mínimo
 * @property {number} max - Valor máximo
 * @property {number} rango - Rango (max - min)
 * @property {number} mediana - Mediana (percentil 50)
 * @property {number} q1 - Primer cuartil (percentil 25)
 * @property {number} q3 - Tercer cuartil (percentil 75)
 * @property {number} iqr - Rango intercuartílico (Q3 - Q1)
 * @property {number} asimetria - Coeficiente de asimetría
 * @property {number} curtosis - Coeficiente de curtosis
 */

/**
 * Calcula todas las estadísticas descriptivas para un conjunto de valores
 * @param {number[]} valores - Array de valores numéricos
 * @returns {EstadisticasDescriptivas} Objeto con todas las estadísticas
 * @throws {Error} Si el array está vacío o no contiene valores válidos
 */
export function calcularDescriptivas(valores) {
    if (!Array.isArray(valores) || valores.length === 0) {
        throw new Error('Se requiere un array con al menos un valor');
    }
    
    const n = valores.length;
    
    // Media
    const suma = valores.reduce((a, b) => a + b, 0);
    const media = suma / n;
    
    // Varianza y desviación estándar (usando n-1 para muestra)
    const sumaCuadrados = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0);
    const varianza = n > 1 ? sumaCuadrados / (n - 1) : 0;
    const desviacion = Math.sqrt(varianza);
    const errorEstandar = desviacion / Math.sqrt(n);
    
    // Ordenar para percentiles
    const ordenados = [...valores].sort((a, b) => a - b);
    const min = ordenados[0];
    const max = ordenados[n - 1];
    
    // Mediana
    const mediana = n % 2 === 0
        ? (ordenados[n / 2 - 1] + ordenados[n / 2]) / 2
        : ordenados[Math.floor(n / 2)];
    
    // Cuartiles
    const q1 = calcularPercentil(ordenados, 25);
    const q3 = calcularPercentil(ordenados, 75);
    
    // Asimetría y curtosis
    const asimetria = calcularAsimetria(valores, media, desviacion, n);
    const curtosis = calcularCurtosis(valores, media, desviacion, n);
    
    return {
        n,
        media,
        desviacion,
        varianza,
        errorEstandar,
        min,
        max,
        rango: max - min,
        mediana,
        q1,
        q3,
        iqr: q3 - q1,
        asimetria,
        curtosis
    };
}

/**
 * Calcula un percentil específico de un array ordenado
 * Usa interpolación lineal para valores intermedios
 * @param {number[]} ordenados - Array de valores ya ordenados ascendentemente
 * @param {number} percentil - Percentil a calcular (0-100)
 * @returns {number} Valor del percentil
 */
export function calcularPercentil(ordenados, percentil) {
    const index = (percentil / 100) * (ordenados.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (lower === upper) {
        return ordenados[lower];
    }
    
    return ordenados[lower] * (1 - weight) + ordenados[upper] * weight;
}

/**
 * Calcula el coeficiente de asimetría (skewness)
 * Mide la falta de simetría de la distribución
 * @param {number[]} valores - Array de valores
 * @param {number} media - Media previamente calculada
 * @param {number} desviacion - Desviación estándar previamente calculada
 * @param {number} n - Tamaño de muestra
 * @returns {number} Coeficiente de asimetría
 */
export function calcularAsimetria(valores, media, desviacion, n) {
    if (desviacion === 0 || n < 3) return 0;
    
    const suma = valores.reduce((acc, v) => 
        acc + Math.pow((v - media) / desviacion, 3), 0
    );
    
    // Fórmula ajustada para muestras
    return (n / ((n - 1) * (n - 2))) * suma;
}

/**
 * Calcula el coeficiente de curtosis (kurtosis)
 * Mide el "apuntamiento" de la distribución respecto a la normal
 * @param {number[]} valores - Array de valores
 * @param {number} media - Media previamente calculada
 * @param {number} desviacion - Desviación estándar previamente calculada
 * @param {number} n - Tamaño de muestra
 * @returns {number} Coeficiente de curtosis (excess kurtosis, 0 = normal)
 */
export function calcularCurtosis(valores, media, desviacion, n) {
    if (desviacion === 0 || n < 4) return 0;
    
    const suma = valores.reduce((acc, v) => 
        acc + Math.pow((v - media) / desviacion, 4), 0
    );
    
    // Fórmula de curtosis con ajuste de Fisher
    const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * suma;
    const ajuste = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    
    return kurtosis - ajuste;
}

/**
 * Calcula la covarianza entre dos conjuntos de valores
 * @param {number[]} valores1 - Primer conjunto de valores
 * @param {number[]} valores2 - Segundo conjunto de valores
 * @returns {number} Covarianza muestral
 * @throws {Error} Si los arrays tienen diferente longitud
 */
export function calcularCovarianza(valores1, valores2) {
    if (valores1.length !== valores2.length) {
        throw new Error('Los arrays deben tener la misma longitud');
    }
    
    const n = valores1.length;
    const media1 = valores1.reduce((a, b) => a + b, 0) / n;
    const media2 = valores2.reduce((a, b) => a + b, 0) / n;
    
    let covarianza = 0;
    for (let i = 0; i < n; i++) {
        covarianza += (valores1[i] - media1) * (valores2[i] - media2);
    }
    
    return covarianza / (n - 1);
}

/**
 * Convierte un array de valores a rangos (para Spearman)
 * Maneja empates asignando el rango promedio
 * @param {number[]} valores - Array de valores a convertir
 * @returns {number[]} Array de rangos correspondientes
 */
export function convertirARangos(valores) {
    const n = valores.length;
    const pares = valores.map((valor, idx) => ({ valor, idx }));
    
    // Ordenar por valor
    pares.sort((a, b) => a.valor - b.valor);
    
    const rangos = new Array(n);
    
    // Asignar rangos considerando empates
    let i = 0;
    while (i < pares.length) {
        let j = i;
        
        // Encontrar todos los valores iguales
        while (j < pares.length && pares[j].valor === pares[i].valor) {
            j++;
        }
        
        // Calcular rango promedio para empates
        const rangoPromedio = (i + 1 + j) / 2;
        
        // Asignar el rango promedio a todos los empates
        for (let k = i; k < j; k++) {
            rangos[pares[k].idx] = rangoPromedio;
        }
        
        i = j;
    }
    
    return rangos;
}

/**
 * Calcula la distribución normal acumulada (CDF)
 * Aproximación de Abramowitz & Stegun
 * @param {number} z - Valor z (estandarizado)
 * @returns {number} Probabilidad acumulada P(Z ≤ z)
 */
export function distribucionNormalAcumulada(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return z > 0 ? 1 - p : p;
}

/**
 * Calcula el logaritmo natural de la función gamma
 * Aproximación de Lanczos
 * @param {number} x - Valor de entrada
 * @returns {number} ln(Γ(x))
 */
export function lnGamma(x) {
    if (x <= 0) return Infinity;
    
    const cof = [
        76.18009172947146,
        -86.50532032941677,
        24.01409824083091,
        -1.231739572450155,
        0.001208650973866179,
        -0.000005395239384953
    ];
    
    let ser = 1.000000000190015;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    
    for (let j = 0; j < 6; j++) {
        ser += cof[j] / (x + j + 1);
    }
    
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Calcula la función beta incompleta regularizada
 * Usada para calcular p-valores de distribución t
 * @param {number} x - Límite superior de integración
 * @param {number} a - Parámetro a
 * @param {number} b - Parámetro b
 * @returns {number} I_x(a, b)
 */
export function betaIncompleta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    
    const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
    const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;
    
    let suma = 1.0;
    let termino = 1.0;
    
    for (let i = 0; i < 100; i++) {
        termino *= (a + i) / (a + b + i) * x;
        suma += termino / (a + i + 1);
        if (Math.abs(termino) < 1e-10) break;
    }
    
    return front * suma;
}

/**
 * Calcula el p-valor para una estadística t de Student
 * @param {number} t - Valor del estadístico t
 * @param {number} gl - Grados de libertad
 * @returns {number} P-valor (una cola)
 */
export function calcularPValorT(t, gl) {
    const x = gl / (gl + t * t);
    return betaIncompleta(x, gl / 2, 0.5);
}

/**
 * Genera un valor aleatorio de distribución normal
 * Método Box-Muller
 * @param {number} [media=0] - Media de la distribución
 * @param {number} [desviacion=1] - Desviación estándar
 * @returns {number} Valor aleatorio con distribución N(media, desviacion)
 */
export function generarValorNormal(media = 0, desviacion = 1) {
    let u1 = Math.random();
    let u2 = Math.random();
    
    // Evitar log(0)
    while (u1 === 0) u1 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    return media + desviacion * z0;
}

/**
 * Suma un array de valores numéricos
 * @param {number[]} valores - Array de valores
 * @returns {number} Suma total
 */
export function sumar(valores) {
    return valores.reduce((a, b) => a + b, 0);
}

/**
 * Calcula el producto de un array de valores
 * @param {number[]} valores - Array de valores
 * @returns {number} Producto total
 */
export function multiplicar(valores) {
    return valores.reduce((a, b) => a * b, 1);
}

export default {
    calcularDescriptivas,
    calcularPercentil,
    calcularAsimetria,
    calcularCurtosis,
    calcularCovarianza,
    convertirARangos,
    distribucionNormalAcumulada,
    lnGamma,
    betaIncompleta,
    calcularPValorT,
    generarValorNormal,
    sumar,
    multiplicar
};
