/**
 * @fileoverview Servicio de parseo y generación de archivos CSV
 * Proporciona funciones para leer, parsear y generar archivos CSV de forma segura.
 * 
 * @module services/csv-parser
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { sanitizeObject, escapeHtml } from '../utils/xss-protection.js';
import { validarFormatoCSV } from '../utils/validators.js';

/**
 * @typedef {Object} OpcionesParseCSV
 * @property {string} [delimitador] - Delimitador (auto-detectado si no se especifica)
 * @property {boolean} [tieneEncabezados=true] - Si la primera fila son encabezados
 * @property {boolean} [sanitizar=true] - Sanitizar valores contra XSS
 * @property {boolean} [convertirNumeros=true] - Convertir strings numéricos a números
 * @property {string} [encoding='utf-8'] - Codificación del archivo
 */

/**
 * @typedef {Object} ResultadoParseCSV
 * @property {boolean} exito - Si el parseo fue exitoso
 * @property {Object[]} datos - Datos parseados
 * @property {string[]} columnas - Nombres de columnas
 * @property {number} totalFilas - Total de filas (sin encabezados)
 * @property {string[]} errores - Errores encontrados
 * @property {string[]} advertencias - Advertencias
 */

/**
 * Detecta el delimitador usado en un texto CSV
 * @param {string} texto - Texto CSV
 * @returns {string} Delimitador detectado (',' o ';')
 */
export function detectarDelimitador(texto) {
    const primeraLinea = texto.split('\n')[0] || '';
    
    const comas = (primeraLinea.match(/,/g) || []).length;
    const puntoYComa = (primeraLinea.match(/;/g) || []).length;
    
    return puntoYComa > comas ? ';' : ',';
}

/**
 * Parsea una línea CSV respetando comillas
 * @param {string} linea - Línea a parsear
 * @param {string} delimitador - Delimitador a usar
 * @returns {string[]} Array de valores
 */
export function parsearLineaCSV(linea, delimitador) {
    const resultado = [];
    let valorActual = '';
    let dentroComillas = false;
    
    for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        const siguienteChar = linea[i + 1];
        
        if (char === '"') {
            if (dentroComillas && siguienteChar === '"') {
                // Comillas escapadas
                valorActual += '"';
                i++; // Saltar siguiente comilla
            } else {
                // Toggle estado de comillas
                dentroComillas = !dentroComillas;
            }
        } else if (char === delimitador && !dentroComillas) {
            resultado.push(valorActual.trim());
            valorActual = '';
        } else {
            valorActual += char;
        }
    }
    
    // Agregar último valor
    resultado.push(valorActual.trim());
    
    return resultado;
}

/**
 * Parsea texto CSV a array de objetos
 * @param {string} textoCSV - Contenido del archivo CSV
 * @param {OpcionesParseCSV} [opciones={}] - Opciones de parseo
 * @returns {ResultadoParseCSV} Resultado del parseo
 */
export function parsearCSV(textoCSV, opciones = {}) {
    const {
        delimitador: delimitadorConfig,
        tieneEncabezados = true,
        sanitizar = true,
        convertirNumeros = true
    } = opciones;
    
    const resultado = {
        exito: false,
        datos: [],
        columnas: [],
        totalFilas: 0,
        errores: [],
        advertencias: []
    };
    
    // Validación inicial
    if (!textoCSV || typeof textoCSV !== 'string') {
        resultado.errores.push('El contenido CSV está vacío o no es válido');
        return resultado;
    }
    
    // Normalizar saltos de línea
    const textoNormalizado = textoCSV.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Dividir en líneas y filtrar vacías
    const lineas = textoNormalizado.split('\n').filter(linea => linea.trim());
    
    if (lineas.length < (tieneEncabezados ? 2 : 1)) {
        resultado.errores.push('El archivo CSV debe tener al menos encabezados y una fila de datos');
        return resultado;
    }
    
    // Detectar o usar delimitador
    const delimitador = delimitadorConfig || detectarDelimitador(textoCSV);
    
    // Obtener encabezados
    let encabezados;
    let inicioData;
    
    if (tieneEncabezados) {
        encabezados = parsearLineaCSV(lineas[0], delimitador);
        inicioData = 1;
    } else {
        // Generar encabezados automáticos
        const primeraFila = parsearLineaCSV(lineas[0], delimitador);
        encabezados = primeraFila.map((_, idx) => `Columna${idx + 1}`);
        inicioData = 0;
    }
    
    // Validar encabezados únicos
    const encabezadosUnicos = [...new Set(encabezados)];
    if (encabezadosUnicos.length !== encabezados.length) {
        resultado.advertencias.push('Se detectaron encabezados duplicados');
    }
    
    resultado.columnas = encabezados;
    
    // Parsear datos
    const datos = [];
    
    for (let i = inicioData; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        
        const valores = parsearLineaCSV(linea, delimitador);
        
        // Verificar cantidad de valores
        if (valores.length !== encabezados.length) {
            resultado.advertencias.push(
                `Fila ${i + 1}: Cantidad de valores (${valores.length}) diferente a encabezados (${encabezados.length})`
            );
        }
        
        // Crear objeto fila
        const fila = {};
        encabezados.forEach((encabezado, idx) => {
            let valor = valores[idx] !== undefined ? valores[idx] : '';
            
            // Convertir números si aplica
            if (convertirNumeros && valor !== '') {
                const num = parseFloat(valor);
                if (!isNaN(num) && isFinite(num)) {
                    valor = num;
                }
            }
            
            fila[encabezado] = valor;
        });
        
        datos.push(fila);
    }
    
    // Sanitizar si es necesario
    resultado.datos = sanitizar ? datos.map(fila => sanitizeObject(fila)) : datos;
    resultado.totalFilas = resultado.datos.length;
    resultado.exito = resultado.errores.length === 0;
    
    return resultado;
}

/**
 * Genera contenido CSV desde un array de objetos
 * @param {Object[]} datos - Array de objetos a convertir
 * @param {Object} [opciones] - Opciones de generación
 * @param {string} [opciones.delimitador=','] - Delimitador a usar
 * @param {string[]} [opciones.columnas] - Columnas a incluir (orden)
 * @param {boolean} [opciones.incluirEncabezados=true] - Incluir fila de encabezados
 * @returns {string} Contenido CSV
 */
export function generarCSV(datos, opciones = {}) {
    const {
        delimitador = ',',
        columnas: columnasConfig,
        incluirEncabezados = true
    } = opciones;
    
    if (!datos || datos.length === 0) {
        return '';
    }
    
    // Determinar columnas
    const columnas = columnasConfig || Object.keys(datos[0]);
    
    // Generar líneas
    const lineas = [];
    
    // Encabezados
    if (incluirEncabezados) {
        lineas.push(columnas.map(col => escaparValorCSV(col, delimitador)).join(delimitador));
    }
    
    // Datos
    datos.forEach(fila => {
        const valores = columnas.map(col => {
            const valor = fila[col];
            return escaparValorCSV(valor, delimitador);
        });
        lineas.push(valores.join(delimitador));
    });
    
    return lineas.join('\n');
}

/**
 * Escapa un valor para CSV
 * @param {*} valor - Valor a escapar
 * @param {string} delimitador - Delimitador usado
 * @returns {string} Valor escapado
 */
function escaparValorCSV(valor, delimitador) {
    if (valor === null || valor === undefined) {
        return '';
    }
    
    const str = String(valor);
    
    // Si contiene caracteres especiales, envolver en comillas
    if (str.includes(delimitador) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
}

/**
 * Valida la estructura de un CSV parseado
 * @param {Object[]} datos - Datos parseados
 * @param {Object} esquema - Esquema de validación {columna: {requerido, tipo, min, max}}
 * @returns {Object} Resultado de validación {valido, errores}
 */
export function validarEstructuraCSV(datos, esquema) {
    const errores = [];
    
    if (!datos || datos.length === 0) {
        errores.push('No hay datos para validar');
        return { valido: false, errores };
    }
    
    // Validar que todas las columnas del esquema existan
    const columnasData = Object.keys(datos[0]);
    const columnasEsquema = Object.keys(esquema);
    
    columnasEsquema.forEach(col => {
        if (!columnasData.includes(col) && esquema[col].requerido) {
            errores.push(`Columna requerida no encontrada: ${col}`);
        }
    });
    
    // Validar cada fila
    datos.forEach((fila, index) => {
        Object.entries(esquema).forEach(([columna, reglas]) => {
            const valor = fila[columna];
            
            // Validar requerido
            if (reglas.requerido && (valor === null || valor === undefined || valor === '')) {
                errores.push(`Fila ${index + 1}: Campo "${columna}" es requerido`);
                return;
            }
            
            if (valor === null || valor === undefined || valor === '') {
                return; // Campo vacío opcional
            }
            
            // Validar tipo
            if (reglas.tipo === 'number') {
                const num = parseFloat(valor);
                if (isNaN(num)) {
                    errores.push(`Fila ${index + 1}: Campo "${columna}" debe ser numérico`);
                    return;
                }
                
                // Validar rangos
                if (reglas.min !== undefined && num < reglas.min) {
                    errores.push(`Fila ${index + 1}: Campo "${columna}" debe ser >= ${reglas.min}`);
                }
                if (reglas.max !== undefined && num > reglas.max) {
                    errores.push(`Fila ${index + 1}: Campo "${columna}" debe ser <= ${reglas.max}`);
                }
            }
        });
    });
    
    return {
        valido: errores.length === 0,
        errores
    };
}

/**
 * Obtiene estadísticas básicas de un CSV parseado
 * @param {Object[]} datos - Datos parseados
 * @returns {Object} Estadísticas {totalFilas, columnas, columnasNumericas}
 */
export function obtenerEstadisticasCSV(datos) {
    if (!datos || datos.length === 0) {
        return {
            totalFilas: 0,
            columnas: [],
            columnasNumericas: []
        };
    }
    
    const columnas = Object.keys(datos[0]);
    const columnasNumericas = columnas.filter(col => {
        // Verificar si la mayoría de valores son numéricos
        const valoresNumericos = datos.filter(fila => {
            const val = fila[col];
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val));
        });
        return valoresNumericos.length > datos.length * 0.5;
    });
    
    return {
        totalFilas: datos.length,
        columnas,
        columnasNumericas
    };
}

export default {
    detectarDelimitador,
    parsearLineaCSV,
    parsearCSV,
    generarCSV,
    validarEstructuraCSV,
    obtenerEstadisticasCSV
};
