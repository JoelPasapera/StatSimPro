/**
 * @fileoverview Módulo de validaciones para datos de entrada y configuraciones
 * Centraliza toda la lógica de validación para mantener consistencia
 * @module utils/validators
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

/**
 * Resultado de una validación
 * @typedef {Object} ValidationResult
 * @property {boolean} valido - Si la validación pasó
 * @property {string[]} errores - Lista de errores encontrados
 * @property {string[]} advertencias - Lista de advertencias (no bloquean)
 */

/**
 * Valida que un valor sea un número válido
 * @param {*} valor - Valor a validar
 * @param {Object} [opciones={}] - Opciones de validación
 * @param {number} [opciones.min] - Valor mínimo permitido
 * @param {number} [opciones.max] - Valor máximo permitido
 * @param {boolean} [opciones.entero=false] - Si debe ser entero
 * @param {boolean} [opciones.positivo=false] - Si debe ser positivo
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarNumero(valor, opciones = {}) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    const num = parseFloat(valor);
    
    if (isNaN(num) || !isFinite(num)) {
        resultado.valido = false;
        resultado.errores.push('El valor debe ser un número válido');
        return resultado;
    }
    
    if (opciones.entero && !Number.isInteger(num)) {
        resultado.valido = false;
        resultado.errores.push('El valor debe ser un número entero');
    }
    
    if (opciones.positivo && num <= 0) {
        resultado.valido = false;
        resultado.errores.push('El valor debe ser positivo (mayor a 0)');
    }
    
    if (opciones.min !== undefined && num < opciones.min) {
        resultado.valido = false;
        resultado.errores.push(`El valor debe ser al menos ${opciones.min}`);
    }
    
    if (opciones.max !== undefined && num > opciones.max) {
        resultado.valido = false;
        resultado.errores.push(`El valor no puede exceder ${opciones.max}`);
    }
    
    return resultado;
}

/**
 * Valida que una cadena no esté vacía y cumpla restricciones
 * @param {*} valor - Valor a validar
 * @param {Object} [opciones={}] - Opciones de validación
 * @param {number} [opciones.minLength=1] - Longitud mínima
 * @param {number} [opciones.maxLength] - Longitud máxima
 * @param {RegExp} [opciones.pattern] - Patrón regex que debe cumplir
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarCadena(valor, opciones = {}) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    if (typeof valor !== 'string') {
        resultado.valido = false;
        resultado.errores.push('El valor debe ser una cadena de texto');
        return resultado;
    }
    
    const str = valor.trim();
    const minLength = opciones.minLength ?? 1;
    
    if (str.length < minLength) {
        resultado.valido = false;
        resultado.errores.push(`El texto debe tener al menos ${minLength} caracteres`);
    }
    
    if (opciones.maxLength && str.length > opciones.maxLength) {
        resultado.valido = false;
        resultado.errores.push(`El texto no puede exceder ${opciones.maxLength} caracteres`);
    }
    
    if (opciones.pattern && !opciones.pattern.test(str)) {
        resultado.valido = false;
        resultado.errores.push('El formato del texto no es válido');
    }
    
    return resultado;
}

/**
 * Valida la configuración de una prueba psicométrica
 * @param {Object} prueba - Configuración de la prueba
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarConfiguracionPrueba(prueba) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    // Validar nombre
    if (!prueba.nombre || typeof prueba.nombre !== 'string' || !prueba.nombre.trim()) {
        resultado.valido = false;
        resultado.errores.push('El nombre de la prueba es requerido');
    }
    
    // Validar número de ítems
    const numItemsVal = validarNumero(prueba.numItems, { min: 1, entero: true });
    if (!numItemsVal.valido) {
        resultado.valido = false;
        resultado.errores.push(`Número de ítems: ${numItemsVal.errores.join(', ')}`);
    }
    
    // Validar media
    const mediaVal = validarNumero(prueba.media);
    if (!mediaVal.valido) {
        resultado.valido = false;
        resultado.errores.push(`Media: ${mediaVal.errores.join(', ')}`);
    }
    
    // Validar desviación estándar
    const deVal = validarNumero(prueba.desviacion, { positivo: true });
    if (!deVal.valido) {
        resultado.valido = false;
        resultado.errores.push(`Desviación estándar: ${deVal.errores.join(', ')}`);
    }
    
    // Validar rango min/max si están definidos
    if (prueba.minimo !== null && prueba.maximo !== null) {
        if (prueba.minimo >= prueba.maximo) {
            resultado.valido = false;
            resultado.errores.push('El mínimo debe ser menor que el máximo');
        }
    }
    
    // Advertencias
    if (prueba.desviacion && prueba.numItems) {
        const rangoEsperado = prueba.numItems * 5;
        if (prueba.desviacion > rangoEsperado / 2) {
            resultado.advertencias.push(
                `La desviación estándar (${prueba.desviacion}) parece alta para ${prueba.numItems} ítems`
            );
        }
    }
    
    return resultado;
}

/**
 * Valida la configuración de una variable sociodemográfica
 * @param {Object} socio - Configuración de la variable
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarConfiguracionSociodemografico(socio) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    // Validar categoría
    if (!socio.categoria || typeof socio.categoria !== 'string' || !socio.categoria.trim()) {
        resultado.valido = false;
        resultado.errores.push('El nombre de la categoría es requerido');
    }
    
    // Validar promedio
    const promedioVal = validarNumero(socio.promedio);
    if (!promedioVal.valido) {
        resultado.valido = false;
        resultado.errores.push(`Promedio: ${promedioVal.errores.join(', ')}`);
    }
    
    // Validar desviación
    const deVal = validarNumero(socio.desviacion, { positivo: true });
    if (!deVal.valido) {
        resultado.valido = false;
        resultado.errores.push(`Desviación estándar: ${deVal.errores.join(', ')}`);
    }
    
    // Validar decimales
    if (socio.decimales !== undefined && socio.decimales !== null) {
        const decimalesVal = validarNumero(socio.decimales, { min: 0, max: 4, entero: true });
        if (!decimalesVal.valido) {
            resultado.valido = false;
            resultado.errores.push(`Decimales: ${decimalesVal.errores.join(', ')}`);
        }
    }
    
    // Validar rango
    if (socio.minimo !== null && socio.maximo !== null) {
        if (socio.minimo >= socio.maximo) {
            resultado.valido = false;
            resultado.errores.push('El mínimo debe ser menor que el máximo');
        }
        
        // Advertencia si promedio está fuera del rango
        if (socio.promedio < socio.minimo || socio.promedio > socio.maximo) {
            resultado.advertencias.push(
                `El promedio (${socio.promedio}) está fuera del rango [${socio.minimo}, ${socio.maximo}]`
            );
        }
    }
    
    return resultado;
}

/**
 * Valida un tamaño muestral
 * @param {number} n - Tamaño muestral
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarTamanoMuestral(n) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    const numVal = validarNumero(n, { min: 2, entero: true });
    if (!numVal.valido) {
        resultado.valido = false;
        resultado.errores = numVal.errores;
        return resultado;
    }
    
    if (n < 30) {
        resultado.advertencias.push(
            'Tamaño muestral < 30: Los análisis estadísticos pueden tener bajo poder'
        );
    }
    
    if (n > 10000) {
        resultado.advertencias.push(
            'Tamaño muestral muy grande: Puede ser poco realista para simulación'
        );
    }
    
    return resultado;
}

/**
 * Valida que los datos sean un array válido para análisis
 * @param {Array} datos - Array de datos
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarDatosAnalisis(datos) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    if (!Array.isArray(datos)) {
        resultado.valido = false;
        resultado.errores.push('Los datos deben ser un array');
        return resultado;
    }
    
    if (datos.length === 0) {
        resultado.valido = false;
        resultado.errores.push('El array de datos está vacío');
        return resultado;
    }
    
    if (datos.length < 3) {
        resultado.valido = false;
        resultado.errores.push('Se necesitan al menos 3 observaciones para análisis estadístico');
        return resultado;
    }
    
    // Verificar que todos los elementos sean objetos
    const primerElemento = datos[0];
    if (typeof primerElemento !== 'object' || primerElemento === null) {
        resultado.valido = false;
        resultado.errores.push('Cada fila de datos debe ser un objeto');
        return resultado;
    }
    
    return resultado;
}

/**
 * Valida la selección de variables para correlación
 * @param {string} var1 - Primera variable
 * @param {string} var2 - Segunda variable
 * @param {string[]} columnasDisponibles - Columnas disponibles en los datos
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarSeleccionVariables(var1, var2, columnasDisponibles) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    if (!var1 || !var2) {
        resultado.valido = false;
        resultado.errores.push('Debe seleccionar ambas variables');
        return resultado;
    }
    
    if (var1 === var2) {
        resultado.valido = false;
        resultado.errores.push('Las variables deben ser diferentes');
        return resultado;
    }
    
    if (!columnasDisponibles.includes(var1)) {
        resultado.valido = false;
        resultado.errores.push(`La variable "${var1}" no existe en los datos`);
    }
    
    if (!columnasDisponibles.includes(var2)) {
        resultado.valido = false;
        resultado.errores.push(`La variable "${var2}" no existe en los datos`);
    }
    
    return resultado;
}

/**
 * Valida formato de CSV
 * @param {string} csvText - Contenido del CSV
 * @returns {ValidationResult} Resultado de la validación
 */
export function validarFormatoCSV(csvText) {
    const resultado = { valido: true, errores: [], advertencias: [] };
    
    if (typeof csvText !== 'string' || !csvText.trim()) {
        resultado.valido = false;
        resultado.errores.push('El contenido CSV está vacío');
        return resultado;
    }
    
    const lineas = csvText.trim().split('\n');
    
    if (lineas.length < 2) {
        resultado.valido = false;
        resultado.errores.push('El CSV debe tener al menos encabezados y una fila de datos');
        return resultado;
    }
    
    // Detectar delimitador
    const primeraLinea = lineas[0];
    const delimitador = primeraLinea.includes(';') ? ';' : ',';
    const numColumnas = primeraLinea.split(delimitador).length;
    
    if (numColumnas < 2) {
        resultado.advertencias.push(
            'El CSV parece tener solo una columna. Verifique el delimitador.'
        );
    }
    
    // Verificar consistencia de columnas
    let filaInconsistente = false;
    for (let i = 1; i < lineas.length; i++) {
        if (lineas[i].trim()) {
            const numColsFila = lineas[i].split(delimitador).length;
            if (numColsFila !== numColumnas) {
                filaInconsistente = true;
                break;
            }
        }
    }
    
    if (filaInconsistente) {
        resultado.advertencias.push(
            'Algunas filas tienen diferente número de columnas'
        );
    }
    
    return resultado;
}

export default {
    validarNumero,
    validarCadena,
    validarConfiguracionPrueba,
    validarConfiguracionSociodemografico,
    validarTamanoMuestral,
    validarDatosAnalisis,
    validarSeleccionVariables,
    validarFormatoCSV
};
